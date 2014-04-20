'use strict';
// socketFactory
angular.module('catchMeApp').factory('emailFactory', function () {
  return {
    remove: function(id){ console.log(id); }
  };
});