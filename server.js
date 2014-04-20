'use strict';
var express = require('express');
var concat = require('concat-stream');
var simplesmtp = require('simplesmtp');
var MailParser = require('mailparser').MailParser;
var mailparser = new MailParser();


// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./lib/config/config');

// Setup Express
var app = express();
require('./lib/config/express')(app);
require('./lib/routes')(app);

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var openSocket;
io.sockets.on('connection', function (socket) {
  console.log('connection');
  openSocket = socket;
  // emit all emails
});

simplesmtp.createSimpleServer({SMTPBanner:'My Server'}, function(req){
  mailparser.on('end', function(email){
    console.log('Email:', email);
    if(openSocket){ openSocket.emit('email', email); }
    // save to database
  });
  req.pipe(mailparser);
  req.accept();
}).listen(1025, function(err){
  var message = err ? err.message : 'SMTP server listening on port 1025';
  console.log(message);
});

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'));
});

// Expose app
exports = module.exports = server;
