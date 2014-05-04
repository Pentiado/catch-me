'use strict';

var simplesmtp = require('simplesmtp');
var MailParser = require('mailparser').MailParser;
var events = require('events');
var eventEmitter = new events.EventEmitter();

exports.register = function () {
  simplesmtp.createSimpleServer({}, function (req) {
    var mailparser = new MailParser();
    mailparser.on('end', function (email) {
      db.insert(email, function (err, newDoc) {
        console.log('Error:', err);
        console.log('Email:', newDoc);
      });
      eventEmitter.emit('email:new', email);
    });
      req.pipe(mailparser);
      req.accept();
  }).listen(1025, function(err){
    var message = err ? err.message : 'SMTP server listening on port 1025';
    console.log(message);
  });

  return eventEmitter;
};