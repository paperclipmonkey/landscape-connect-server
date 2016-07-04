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
	}
})();