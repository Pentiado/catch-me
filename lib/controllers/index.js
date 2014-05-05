'use strict';

var path = require('path');
var forever = require('forever');

exports.partials = function (req, res) {
  var stripped = req.url.split('.')[0];
  var requestedView = path.join('./', stripped);
  res.render(requestedView, function(err, html) {
    if (err) {
      console.log('Error rendering partial \'' + requestedView + '\'\n', err);
      res.status(404);
      res.send(404);
    } else {
      res.send(html);
    }
  });
};

exports.quit = function (req, res) {
  forever.list(false, function (err, list){
    var currentIndex;
    for (var i = 0; i < list.length; i++) {
      if (list[0].pid === process.pid) {
        currentIndex = i;
        break;
      }
    }
    forever.stop(currentIndex);
  });
};

exports.index = function(req, res) {
  res.render('index');
};
