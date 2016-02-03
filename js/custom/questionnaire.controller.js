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
    questionnaireCtrl.$inject = ['$scope', '$http', '$stateParams'];
    function questionnaireCtrl($scope, $http, $stateParams) {
        $http.get("/api/questionnaires/" + $stateParams.questionnaireId).success(function(data, status) {
            console.log(data, status)
            $scope.questionnaire = data;
        })

        $scope.delete = function(a){
            console.log("Deleting Questionnaire")
            $http.delete("/api/questionnaires/" +  $stateParams.questionnaireId).success(function(data, status) {
                console.log(data, status)
            })
        }
    }
})();