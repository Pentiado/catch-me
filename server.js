'use strict';
// var smtp = require('./stmp_server.js');
var express = require('express');
var smtp = require('./smtp_server.js');

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./lib/config/config');

// Setup Express
var app = express();
require('./lib/config/express')(app);
require('./lib/routes')(app);

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  console.log('connection');
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'));

  smtp.on('startData', function(connection){
    console.log('Message from:', connection.from);
    console.log('Message to:', connection.to);
  });

  smtp.on('data', function(connection, chunk){
    console.log('data reciving');
  });

  smtp.on('dataReady', function(connection, callback){
    console.log('Incoming message saved to /tmp/message.txt');
    callback(null, 'ABC1');
  });

});


// Expose app
exports = module.exports = server;
