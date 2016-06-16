/**=========================================================
 * Module: response.controller.js
 * Controller for response
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('app.questions')
        .controller('responseCtrl', responseCtrl);
    /*jshint -W055 */
    responseCtrl.$inject = ['$resource', '$timeout', 'questionnairesDataService', '$scope', '$http', '$stateParams', '$state'];
    function responseCtrl($resource, $timeout, questionnairesDataService, $scope, $http, $stateParams, $state) {
        angular.extend($scope, {
            map:{
              center: {
                  lat: 55,
                  lng: 0,
                  zoom: 5
              },
              defaults: {
                  scrollWheelZoom: false
              },
              markers: [
              ]
            }
        })

        $http.get("/api/questionnaires/" + $stateParams.questionnaireId + "/responses/" + $stateParams.responseId).success(function(data, status) {
            console.log(data, status)
            $scope.response = data;
            $scope.map.markers.push(data)
        })

        $http.get("/api/questionnaires/" + $stateParams.questionnaireId).success(function(data, status) {
            $scope.questionnaire = data;
        })

        $scope.delete = function(a){
            console.log("Deleting Response")
            $http.delete("/api/questionnaires/" +  $stateParams.questionnaireId + "/responses" + $stateParams.responseId).success(function(data, status) {
                console.log(data, status)
                $state.go('app.questionnaires')
            })
        }

        $scope.isImage = function(filename){
          return ['jpg', 'jpeg', 'png', 'tiff'].indexOf(filename.split('.').pop()) != -1
        }

        $scope.isAudio = function(filename){
          return ['aac', 'mp3'].indexOf(filename.split('.').pop()) != -1
        }

        $scope.getUrl = function(chunk){
          return '/api/media/' + chunk
        }

        $scope.getPublicUrl = function(chunk){
          return '/app/#/page/questionnaires/' + chunk
        }

        var vm = $scope;
        vm.title = 'Controller';
    }
})();