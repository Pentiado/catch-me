'use strict';

angular.module('catchMeApp')
.controller('ListController', function ($scope, mySocket) {
  $scope.loading = true;
  $scope.emails = [];
  mySocket.on('emails', function (emails) {
    console.log(emails);
    $scope.emails = $scope.emails.concat(emails);
  });
});
