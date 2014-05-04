'use strict';

exports.details = function (req, res) {
  var email = req.url.split('.');
  var requestedView = db.find({id: email[0]}).email[1];
  res.render(requestedView, function (err, html) {
    if (err) {
      console.log('Error rendering partial \'' + requestedView + '\'\n', err);
      res.status(404);
      res.send(404);
    } else {
      res.send(html);
    }
  });
};

exports.download = function (req, res) {
  db.find({id: req.id}, function (err, email) {
    res.download(email.html, 'email-' + email.id + '.eml');
  });
};
