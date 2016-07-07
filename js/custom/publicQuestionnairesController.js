(function() {
    'use strict';

    angular
        .module('app.questions')
        .controller('publicQuestionnairesCtrl', publicQuestionnairesCtrl);
    /*jshint -W055 */
    publicQuestionnairesCtrl.$inject = ['$filter', '$resource', 'questionnairesDataService', '$scope', '$http', '$state'];
    function publicQuestionnairesCtrl($filter, $resource, questionnairesDataService, $scope, $http, $state) {
    	$scope.questionnaires = [];

	    $http.get("/api/questionnaires/public/").success(function(data, status) {
	        $scope.questionnaires = data.result;
	    })

        $scope.generateColor = function(obj){
            //Work it out from the quickCode - consistent
            var num = "" + parseInt(obj.serverId, 16);
            for (var i = 0; i < num.length; i++) {
                if(parseInt(num[i]) < 4){
                    return parseInt(num[i])
                }
            }
            return obj.color = Math.ceil(Math.random()*4)-1
        }

        $scope.getImage = function(data, obj){
            if(data){
                return data
            }

            if(!obj.color){
                obj.color = $scope.generateColor(obj)
            }

            //.Gif B64 1px*1px image files
            var colors = [
                'R0lGODlhAQABAIAAAAGPuQAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==',
                'R0lGODlhAQABAIAAABCWAAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==',
                'R0lGODlhAQABAIAAALokVAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==',
                'R0lGODlhAQABAIAAAP/OAAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='
            ]

            return 'data:image/gif;base64,' + colors[obj.color];
        }
	}

})();