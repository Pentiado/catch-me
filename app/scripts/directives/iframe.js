'use strict';

angular.module('catchMeApp').directive('myIframe', function () {
  return {
    link: function (scope, element) {
      element.on('load', function () {
        element[0].style.height = element[0].contentWindow.document.body.scrollHeight + 'px';
      });
    }
  };
});
