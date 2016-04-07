/**=========================================================
 * Module: config.js
 * App routes and resources configuration
 =========================================================*/


(function() {
    'use strict';

    angular
        .module('app.routes')
        .config(routesConfig);

    routesConfig.$inject = ['$stateProvider', '$locationProvider', '$urlRouterProvider', 'RouteHelpersProvider'];
    function routesConfig($stateProvider, $locationProvider, $urlRouterProvider, helper){

        // Set the following to true to enable the HTML5 Mode
        // You may have to set <base> tag in index and a routing configuration in your server
        $locationProvider.html5Mode(false);

        // defaults to dashboard
        $urlRouterProvider.otherwise('/app/dashboard');

        //
        // Application Routes
        // -----------------------------------
        $stateProvider
          .state('app', {
              url: '/app',
              abstract: true,
              templateUrl: helper.basepath('app.html'),
              resolve: helper.resolveFor('fastclick', 'modernizr', 'icons', 'screenfull', 'animo', 'sparklines', 'slimscroll', 'classyloader', 'toaster', 'whirl')
          })
          .state('app.dashboard', {
              url: '/dashboard',
              title: 'Dashboard',
              templateUrl: helper.basepath('dashboard.html'),
              resolve: helper.resolveFor('flot-chart','flot-chart-plugins', 'weather-icons')
          })
          .state('app.questionnaires', {
              url: '/questionnaires',
              title: 'Questionnaires',
              templateUrl: helper.basepath('questionnaires.html'),
              resolve: helper.resolveFor('ngTable', 'ngTableExport')
          })
          .state('app.questionnairenew', {
              url: '/questionnaires/new/',
              title: 'New Questionnaire',
              templateUrl: helper.basepath('questionnairenew.html'),
              resolve: helper.resolveFor('bm.bsTour', 'jquery-ui', 'jquery-ui-widgets', 'ui.sortable')
          })
          .state('app.questionnaire', {
              url: '/questionnaires/:questionnaireId',
              title: 'Questionnaire',
              templateUrl: helper.basepath('questionnaire.html'),
              controller: 'questionnaireCtrl',
              resolve: helper.resolveFor('ngTable', 'ngTableExport')
          })
          .state('app.response', {
              url: '/questionnaires/:questionnaireId/responses/:responseId',
              title: 'Response',
              templateUrl: helper.basepath('response.html'),
              controller: 'responseCtrl',
              resolve: helper.resolveFor('ngTable', 'ngTableExport')
          })
          //
          // Single Page Routes
          // -----------------------------------
          .state('page', {
              url: '/page',
              templateUrl: 'app/pages/page.html',
              resolve: helper.resolveFor('modernizr', 'icons'),
              controller: ['$rootScope', function($rootScope) {
                  $rootScope.app.layout.isBoxed = false;
              }]
          })
          .state('page.login', {
              url: '/login',
              title: 'Login',
              templateUrl: 'app/pages/login.html'
          })
          .state('page.register', {
              url: '/register',
              title: 'Register',
              templateUrl: 'app/pages/register.html'
          })
          .state('page.recover', {
              url: '/recover',
              title: 'Recover',
              templateUrl: 'app/pages/recover.html'
          })
          .state('page.lock', {
              url: '/lock',
              title: 'Lock',
              templateUrl: 'app/pages/lock.html'
          })
          .state('page.404', {
              url: '/404',
              title: 'Not Found',
              templateUrl: 'app/pages/404.html'
          })

          /* Questionnaires public list */
          .state('page.questionnaires', {
              url: '/questionnaires',
              title: 'Questionnaires',
              templateUrl: 'app/pages/questionnaire-list.html'
          })
          .state('page.questionnaire', {
              url: '/questionnaires/:questionnaireId',
              title: 'Questionnaire',
              templateUrl: 'app/pages/questionnaire-detail.html'
          })
          //
          // CUSTOM RESOLVES
          //   Add your own resolves properties
          //   following this object extend
          //   method
          // -----------------------------------
          // .state('app.someroute', {
          //   url: '/some_url',
          //   templateUrl: 'path_to_template.html',
          //   controller: 'someController',
          //   resolve: angular.extend(
          //     helper.resolveFor(), {
          //     // YOUR RESOLVES GO HERE
          //     }
          //   )
          // })
          ;

    } // routesConfig

})();

