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

        window.mScope = $scope

        $http.get("/api/questionnaires/" + $stateParams.questionnaireId).success(function(data, status) {
            $scope.questionnaire = data;

            $http.get("/api/questionnaires/" + $stateParams.questionnaireId + "/responses/" + $stateParams.responseId).success(function(data, status) {
                $scope.response = data;
                $scope.map.markers.push(data)

                //build the response object from the questionnaire and response
                $scope.mResponse = $scope.questionnaire.sections
                for (var i = $scope.mResponse.length - 1; i >= 0; i--) {
                    var section =  $scope.mResponse[i]
                    //console.log("section", section)
                    for (var x = section.questions.length - 1; x >= 0; x--) {
                        var question = section.questions[x]
                        //console.log("question", question)
                        section.questions[x] = {
                            title: section.questions[x].title,
                            answer: getQuestionResponse(section.sectionId, question.questionId)
                        }
                    }
                }
            })

        })

        $scope.delete = function(a){
            console.log("Deleting Response")
            $http.delete("/api/questionnaires/" +  $stateParams.questionnaireId + "/responses" + $stateParams.responseId).success(function(data, status) {
                $state.go('app.questionnaires')
            })
        }

        var getQuestionResponse = function(sectionId, questionId){
            //console.log("Looking up question:", sectionId, questionId)
            try{
                return $scope.response.data[sectionId][questionId]
            } catch(e){
                console.log("Didn't find answer:", sectionId, questionId)
                return
            }
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