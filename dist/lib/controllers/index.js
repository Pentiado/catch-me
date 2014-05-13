'use strict';

var path = require('path');
var forever = require('forever');

exports.partials = function (req, res) {
  var stripped = req.url.split('.')[0];
  var requestedView = path.join('./', stripped);
  res.render(requestedView, function (err, html) {
    if (err) {
      res.status(404);
      res.send(404);
    } else {
      res.send(html);
    }
  });
};

exports.quit = function (req, res) {
  forever.list(false, function (err, list) {
    if (err) { return res.send(500, err); }
    list = list || [];
    var currentProcess;
    for (var i = 0; i < list.length; i++) {
      if (list[i].pid === process.pid) {
        currentProcess = i;
        break;
      }
    }
    if (currentProcess || currentProcess === 0) {
      forever.stop(currentProcess);
      return res.send(200);
    }
    var message = process.env !== 'production' ?
      'CatchMe is not in production mode' :
      'Error, I can\'t find current process';
    res.send(404, message);
  });
};

exports.index = function(req, res) {
  res.render('index');
};
