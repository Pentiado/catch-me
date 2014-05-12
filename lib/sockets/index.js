'use strict';

function onConnect (socket, db) {
  require('./emails').register(socket, db);
}

exports.onConnect = onConnect;
