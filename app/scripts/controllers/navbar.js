'use strict';

angular.module('catchMeApp')
.controller('NavbarController', function ($scope, emailFactory, appFactory) {

  $scope.remove = function(){
    emailFactory.remove();
  };

  $scope.quit = function(){
    appFactory.quit();
  };

});
