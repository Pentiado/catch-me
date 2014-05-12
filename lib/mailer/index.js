'use strict';

var simplesmtp = require('simplesmtp');
var MailParser = require('mailparser').MailParser;
var events = require('events');
var eventEmitter = new events.EventEmitter();
var emailGuide = require('email-guide');

exports.register = function (port) {
  simplesmtp.createSimpleServer({}, function (req) {
    var mailparser = new MailParser();
    mailparser.on('end', function (email) {
      emailGuide(email.html, function (err, guide) {
        if (err) { return eventEmitter.emit('email:error', JSON.stringify(err)); }
        email.guide = guide;
        db.insert(email, function (err, newDoc) {
          if (err) { return eventEmitter.emit('email:error', JSON.stringify(err)); }
          eventEmitter.emit('email:new', newDoc);
        });
      });
    });
    req.pipe(mailparser);
    req.accept();
  }).listen(port, function (err) {
    var message = err ? err.message : 'SMTP server listening on port ' + port;
    console.log(message);
  });
  return eventEmitter;
};