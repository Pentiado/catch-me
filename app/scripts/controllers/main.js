'use strict';

angular.module('catchMeApp')
.controller('MainController', ['$scope', 'mySocket', 'emailFactory', 'appFactory',
  function ($scope, mySocket, emailFactory, appFactory) {
    $scope.loading = true;
    $scope.emails = [];
    mySocket.on('emails', function (emails) {
      $scope.emails = $scope.emails.concat(emails);
    });

    $scope.deleteEmail = function (id) {
      var i = $scope.emails.length;
      while (i--) {
        if ($scope.emails[i].id === id) {
          $scope.emails.splice(i, 1);
          i = 0;
        }
      }
      emailFactory.remove(id);
    };

    $scope.deleteAll = function () {
      $scope.emails = [];
      emailFactory.removeAll();
    };

    $scope.quit = function(){
      appFactory.quit();
    };
  }
]);
