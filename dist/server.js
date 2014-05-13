'use strict';

var argv = require('minimist')(process.argv.slice(2));
var express = require('express');
var mailer = require('./lib/mailer');
var sockets = require('./lib/socketio.js');
var Datastore = require('nedb');
var db = new Datastore();
GLOBAL.db = db;

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./lib/config/config.js');

// Setup Express
var app = express();
require('./lib/config/express')(app);
require('./lib/routes')(app);

var server = require('http').createServer(app);

var mail = mailer.register(argv.mailPort || config.mailPort);
sockets.register(server, mail);

var serverPort = argv.appPort || config.port;
server.listen(serverPort, config.ip, function () {
  console.log('Express server listening on %s, in %s mode', serverPort, process.env.NODE_ENV);
});

// Expose app
exports = module.exports = server;
