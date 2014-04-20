'use strict';

angular.module('catchMeApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
])
.config(function ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'partials/main',
      controller: 'MainCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
  $locationProvider.html5Mode(true);
}).run(function(){
  var socket = io.connect('http://localhost');
  socket.on('email', function (data) {
    console.log(data);
  });
});