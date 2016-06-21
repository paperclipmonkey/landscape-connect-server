/**=========================================================
 * Module: questionnaires.controller.js
 * Controller for questionnairess
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('app.questions')
        .controller('publiQuestionnaireCtrl', publicQuestionnaireCtrl);
    /*jshint -W055 */
    publicQuestionnaireCtrl.$inject = ['$scope', '$http', '$stateParams', '$state'];
    function publicQuestionnaireCtrl($scope, $http, $stateParams, $state) {
        $http.get("/api/questionnaires/" + $stateParams.questionnaireId).success(function(data, status) {
            $scope.questionnaire = data;
        })
    }
})();