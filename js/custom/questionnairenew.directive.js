// // /**=========================================================
// //  * Module: questionnairenew.directive.js
// //  * New questionnaire JSON
// //  =========================================================*/

(function() {
    'use strict';

    angular
        .module('app.questions')
        .directive('jsonText', jsonText);

    function jsonText() {
      return {
        restrict: 'A', // only activate on element attribute
        require: 'ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModelCtrl) {
          var lastValid

          // push() if faster than unshift(), and avail. in IE8 and earlier (unshift isn't)
          ngModelCtrl.$parsers.push(fromUser)
          ngModelCtrl.$formatters.push(toUser)

          // clear any invalid changes on blur
          element.bind('blur', function () {
            element.val(toUser(scope.$eval(attrs.ngModel)))
          })

          // $watch(attrs.ngModel) wouldn't work if this directive created a new scope
          // see http://stackoverflow.com/questions/14693052/watch-ngmodel-from-inside-directive-using-isolate-scope how to do it then
          scope.$watch(attrs.ngModel, function (newValue, oldValue) {
            lastValid = lastValid || newValue

            if (newValue !== oldValue) {
              ngModelCtrl.$setViewValue(toUser(newValue))

              // TODO avoid this causing the focus of the input to be lost..
              ngModelCtrl.$render()
            }
          }, true) // MUST use objectEquality (true) here, for some reason..

          function fromUser (text) {
            // Beware: trim() is not available in old browsers
            if (!text || text.trim() === '') {
              return {}
            } else {
              try {
                lastValid = angular.fromJson(text)
                ngModelCtrl.$setValidity('invalidJson', true)
              } catch (e) {
                ngModelCtrl.$setValidity('invalidJson', false)
              }
              return lastValid
            }
          }

          function toUser (object) {
            // better than JSON.stringify(), because it formats + filters $$hashKey etc.
            return angular.toJson(object, true)
          }
        }
      }
    };

    angular
        .module('app.questions')
        .directive('appFilereader', appFilereader);

    function appFilereader($q) {
      var slice = Array.prototype.slice;

      return {
          restrict: 'A',
          require: '?ngModel',
          link: function(scope, element, attrs, ngModel) {
                  if (!ngModel) return;

                  ngModel.$render = function() {};

                  element.bind('change', function(e) {
                      var element = e.target;

                      $q.all(slice.call(element.files, 0).map(readFile))
                          .then(function(values) {
                              if (element.multiple) ngModel.$setViewValue(values);
                              else ngModel.$setViewValue(values.length ? values[0] : null);
                          });

                      function readFile(file) {
                          var deferred = $q.defer();

                          var reader = new FileReader();
                          reader.onload = function(e) {
                              deferred.resolve(e.target.result);
                          };
                          reader.onerror = function(e) {
                              deferred.reject(e);
                          };
                          reader.readAsDataURL(file);

                          return deferred.promise;
                      }

                  }); //change

              } //link
      }; //return
    };
})();
