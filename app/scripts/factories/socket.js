'use strict';

angular.module('catchMeApp').factory('mySocket', ['socketFactory', function (socketFactory) {
  return socketFactory();
}]);
