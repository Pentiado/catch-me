'use strict';

var sockets = require('./sockets');

exports.register = function (server, mailer) {
  var io = require('socket.io').listen(server);

  io.sockets.on('connection', function (socket) {
    socket.on('disconnect', function () {
      console.info('[%s] DISCONNECTED', socket.address);
    });
    socket.on('quit', function (data, cb) {
      console.log('quit');
    });
    sockets.onConnect(socket, mailer);
    console.info('[%s] CONNECTED', socket.address);
  });
};
