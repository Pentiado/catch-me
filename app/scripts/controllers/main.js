'use strict';

angular.module('catchMeApp')
.controller('MainController', ['$scope', 'mySocket', 'emailFactory', 'appFactory',
  function ($scope, mySocket, emailFactory, appFactory) {
    $scope.loading = true;
    $scope.emails = [];

    mySocket.on('emails', function (emails) {
      console.log(emails);
      $scope.emails = $scope.emails.concat(emails);
    });

    $scope.clear = function () {
      $scope.emails = [];
      mySocket.emit('emails:delete');
    };

    $scope.quit = function () {
      appFactory.quit();
    };

    $scope.select = function (id) {
      var i = $scope.emails.length;
      var email;
      while (i--) {
        email = $scope.emails[i];
        if (email._id === id) {
          $scope.selected = email;
          i = 0;
        }
      }
    };
  }
]);
