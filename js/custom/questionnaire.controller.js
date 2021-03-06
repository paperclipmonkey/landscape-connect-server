/**=========================================================
 * Module: questionnaires.controller.js
 * Controller for questionnaire
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('app.questions')
        .controller('questionnaireCtrl', questionnaireCtrl);
    /*jshint -W055 */
    questionnaireCtrl.$inject = ['$filter', 'ngTableParams', '$resource', '$timeout', 'questionnairesDataService', '$scope', '$http', '$stateParams', '$state'];
    function questionnaireCtrl($filter, ngTableParams, $resource, $timeout, questionnairesDataService, $scope, $http, $stateParams, $state) {
        $http.get("/api/questionnaires/" + $stateParams.questionnaireId).success(function(data, status) {
            $scope.questionnaire = data;
        })

        $http.get("/api/questionnaires/" + $stateParams.questionnaireId + "/statistics").success(function(data, status) {
            $scope.stats = data;
        })

        $scope.delete = function(a){
            $http.delete("/api/questionnaires/" +  $stateParams.questionnaireId).success(function(data, status) {
                $state.go('app.questionnaires')
            })
        }

        $scope.duplicate = function(a){
          $state.go('app.questionnairenew', {questionnaireId: $stateParams.questionnaireId})
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

        ////////////////

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
        });



        function activate() {
            var Api = $resource('/api/questionnaires/' + $stateParams.questionnaireId + '/responses');

            $http.get('/api/questionnaires/' + $stateParams.questionnaireId + '/responses')
            .then(function(response) {
                $scope.map.markers = response.data.result;
            });

            vm.tableResponses = new ngTableParams({
                page: 1,            // show first page
                count: 100,           // count per page
                filter: {
                    name: '',
                    quickCode: ''
                    // name: 'M'       // initial filter
                }
                }, {
                  total: 0,           // length of data
                  //counts: [],         // hide page counts control
                  getData: function($defer, params) {
                      // Service using cache to avoid mutiple requests
                      questionnairesDataService.getData( $defer, params, Api);
                      
                      /* direct ajax request to api (perform result pagination on the server)
                      Api.get(params.url(), function(data) {
                          $timeout(function() {
                              // update table params
                              params.total(data.total);
                              // set new data
                              $defer.resolve(data.result);
                          }, 500);
                      });
                      */
                  }
                });

        }

        activate();
    }
})();