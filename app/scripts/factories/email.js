'use strict';
// socketFactory
angular.module('catchMeApp').factory('emailFactory', ['mySocket', function () {
  return {
    removeAll: function () {
      $http.delete('/emails');
    }
  };
}]);