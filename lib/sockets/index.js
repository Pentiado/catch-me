'use strict';

function _register(socket, db) {
  require('./emails').register(socket, db);
}

function onConnect(socket, db) {
  _register(socket, db);
}

exports.onConnect = onConnect;
