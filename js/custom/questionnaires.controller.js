/**=========================================================
 * Module: questionnaires.controller.js
 * Controller for questionnairess
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('app.questions')
        .controller('questionnairesCtrl', questionnairesCtrl);
    /*jshint -W055 */
    questionnairesCtrl.$inject = ['$filter', 'ngTableParams', '$resource', '$timeout', 'questionnairesDataService'];

    function questionnairesCtrl($filter, ngTableParams, $resource, $timeout, questionnairesDataService) {
        var vm = this;
        vm.title = 'Controller';

        activate();

        ////////////////

        function activate() {
            var Api = $resource('/api/questionnaires');

            vm.tableParams5 = new ngTableParams({
                page: 1,            // show first page
                count: 100,           // count per page
                filter: {
                    name: '',
                    quickCode: ''
                    // name: 'M'       // initial filter
                }
                }, {
                  total: 0,           // length of data
                  counts: [],         // hide page counts control
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
    }
})();
