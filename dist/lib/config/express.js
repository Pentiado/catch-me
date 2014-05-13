'use strict';

var express = require('express'),
    favicon = require('static-favicon'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    errorHandler = require('errorhandler'),
    path = require('path'),
    config = require('./config.js');

/**
 * Express configuration
 */
module.exports = function(app) {
  var env = app.get('env');

  if ('development' === env) {
    app.use(require('connect-livereload')());

    // Disable caching of scripts for easier testing
    app.use(function noCache(req, res, next) {
      if (req.url.indexOf('/scripts/') === 0) {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', 0);
      }
      next();
    });

    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'app')));
    app.set('views', config.root + '/app/views');
  }

  if ('production' === env) {
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(config.root + '/public'));
    app.set('views', config.root + '/public/views');
  }

  app.set('view engine', 'jade');
  app.use(bodyParser());
  app.use(methodOverride());

  // Error handler - has to be last
  if ('development' === app.get('env')) {
    app.use(errorHandler());
  }
};