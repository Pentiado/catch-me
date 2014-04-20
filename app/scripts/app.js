/* global io */
'use strict';

angular.module('catchMeApp', [
  'ngSanitize',
  'btford.socket-io'
]).run(function(){
  var socket = io.connect('http://localhost');
  socket.on('email', function (data) {
    console.log(data);
  });
});