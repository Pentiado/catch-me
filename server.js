'use strict';

var express = require('express');
var mailer = require('./lib/mailer');
var sockets = require('./lib/socketio.js');
var Datastore = require('nedb');
var db = new Datastore();
GLOBAL.db = db;

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./lib/config/config');

// Setup Express
var app = express();
require('./lib/config/express')(app);
require('./lib/routes')(app);

var server = require('http').createServer(app);

var mail = mailer.register();
sockets.register(server, mail);

server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'));
});

// Expose app
exports = module.exports = server;
