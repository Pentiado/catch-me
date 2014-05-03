'use strict';
// socketFactory
angular.module('catchMeApp').factory('emailFactory', ['$http', function ($http) {
  return {
    remove: function (id) {
      $http.delete('/emails/' + id);
    },
    removeAll: function () {
      $http.delete('/emails');
    }
  };
}]);