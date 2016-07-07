/**=========================================================
 * Module: questionnaires.controller.js
 * Controller for questionnairess
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('app.questions')
        .controller('InsideCtrl', InsideCtrl)
        .controller('publiQuestionnaireCtrl', publicQuestionnaireCtrl);
    /*jshint -W055 */
    publicQuestionnaireCtrl.$inject = ['ngDialog', '$scope', '$http', '$stateParams', '$state'];
    function publicQuestionnaireCtrl(ngDialog, $scope, $http, $stateParams, $state) {
        $http.get("/api/questionnaires/" + $stateParams.questionnaireId).success(function(data, status) {
            $scope.questionnaire = data;
        })

        $scope.openInstall = function () {
            console.log('Opening dialog')
            ngDialog.open({ template: 'firstDialogId' });//controller: 'InsideCtrl', data: {foo: 'some data'}
        };
    }

    InsideCtrl.$inject = ['$scope', 'ngDialog'];
    function InsideCtrl($scope, ngDialog) {

        activate();

        ////////////////

        function activate() {
          $scope.dialogModel = {
            message : 'message from passed scope'
          };
          $scope.openSecond = function () {
            ngDialog.open({
              template: '<p class="lead m0"><a href="" ng-click="closeSecond()">Close all by click here!</a></h3>',
              plain: true,
              closeByEscape: false,
              controller: 'SecondModalCtrl'
            });
          };
        }
    }
})();