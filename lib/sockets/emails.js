'use strict';

function _onDestroy (socket, data, cb) {
  db.remove({}, {}, cb);
}

function _sendAllEmails (socket) {
  db.find({}, function (err, emails) {
    if (err) { throw err; }
    socket.emit('emails', emails);
  });
}

function _newEmail (socket, email) {
  socket.emit('emails', [email]);
}

function register (socket, mailer) {
  _sendAllEmails(socket);
  socket.on('emails:delete', function (data, cb) {
    _onDestroy(socket, data, cb);
  });
  mailer.on('email:new', function (email) {
    _newEmail(socket, email);
  });
}

exports.register = register;
