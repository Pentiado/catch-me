'use strict';

var MailComposer = require('mailcomposer').MailComposer;

exports.details = function (req, res) {
  var id = req.param('email');
  db.find({_id: id}, function (err, email) {
    if (err) { return res.send(500, err); }
    if (!email.length) { return res.send(404); }
    res.send(email[0].html);
  });
};

exports.download = function (req, res) {
  var id = req.param('email');
  db.find({_id: id}, function (err, emails) {
    if (err) { return res.send(500, err); }
    if (!emails) { return res.send(404); }
    res.attachment('email-' + id + '.eml');
    res.setHeader('Content-Type', 'application/octet-stream');

    var mailcomposer = new MailComposer();
    mailcomposer.setMessageOption(emails[0]);
    mailcomposer.streamMessage();
    mailcomposer.pipe(res);
  });
};
