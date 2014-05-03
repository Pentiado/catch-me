'use strict';

var express = require('express');
var simplesmtp = require('simplesmtp');
var MailParser = require('mailparser').MailParser;
var Datastore = require('nedb');
var db = new Datastore();

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
  openSocket = socket;
  db.find({}, function (err, emails) {
    if (err) { console.log(err); }
    if (emails) { console.log('emails:', emails); }
    openSocket.emit('emails', emails);
  });
});

simplesmtp.createSimpleServer({SMTPBanner:'My Server'}, function (req) {
  var mailparser = new MailParser();
  mailparser.on('end', function (email) {
    db.insert(email, function (err, newDoc) {
      console.log('Error:', err);
      console.log('Email:', newDoc);
    });
    if (openSocket) { openSocket.emit('emails', [email]); }
  });
   req.pipe(mailparser);
  req.accept();
}).listen(1025, function(err){
  var message = err ? err.message : 'SMTP server listening on port 1025';
  console.log(message);
});

server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'));
});

// Expose app
exports = module.exports = server;
