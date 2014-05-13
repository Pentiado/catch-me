'use strict';

var sockets = require('./sockets');

exports.register = function (server, mailer) {
  var io = require('socket.io').listen(server);
  io.set('log level', 1);

  io.sockets.on('connection', function (socket) {
    sockets.onConnect(socket, mailer);
  });
};
