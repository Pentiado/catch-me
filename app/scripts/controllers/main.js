'use strict';

angular.module('catchMeApp')
.controller('MainController', ['$scope', 'mySocket',
  function ($scope, mySocket) {
    $scope.loading = true;
    $scope.emails = [];

    mySocket.on('emails', function (emails) {
      $scope.emails = $scope.emails.concat(emails);
    });

    $scope.clear = function () {
      $scope.emails = [];
      delete $scope.selected;
      mySocket.emit('emails:delete');
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
