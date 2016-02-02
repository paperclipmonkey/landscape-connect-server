/**=========================================================
 * Module: questionnaires.controller.js
 * Controller for questionnairess
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('app.questions')
        .controller('questionnaireCtrl', questionnaireCtrl);
    /*jshint -W055 */
    questionnaireCtrl.$inject = ['$rootScope', '$http', '$stateParams'];
    function questionnaireCtrl($scope, $http, $stateParams) {
        console.log("$scope:", $stateParams)

        $scope.route = $stateParams
    }
})();