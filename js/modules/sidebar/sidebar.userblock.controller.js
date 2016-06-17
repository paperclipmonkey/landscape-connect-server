(function() {
    'use strict';

    angular
        .module('app.sidebar')
        .controller('UserBlockController', UserBlockController);

    UserBlockController.$inject = ['$http', '$rootScope', '$scope', '$state'];
    function UserBlockController($http, $rootScope, $scope, $state) {

        activate();

        ////////////////

        function activate() {
          //Connect to the login service
          //Download the user...
          //If can't download show login page instead
          $http
            .get('/api/account/details')
            .then(function(response) {
              if(!response.data.account){
                return $state.go('page.login');
              }
              $rootScope.user = response.data.account;
            }, function() {
              console.log("Error logging in");
              $state.go('page.login');
            });

          // $rootScope.user = {
          //   name:     'John',
          //   job:      'ng-developer',
          //   picture:  'app/img/user/02.jpg'
          // };

          // Hides/show user avatar on sidebar
          $rootScope.toggleUserBlock = function(){
            $rootScope.$broadcast('toggleUserBlock');
          };

          $rootScope.logOut = function(){
            $rootScope.$broadcast('logOut');
          };

          $rootScope.userBlockVisible = true;

          var detach = $rootScope.$on('toggleUserBlock', function(/*event, args*/) {
            $rootScope.userBlockVisible = ! $rootScope.userBlockVisible;
          });
          $scope.$on('$destroy', detach);


          //Logout
          var logOutFunction = $rootScope.$on('logOut', function(/*event, args*/) {
            $http
              .post('/api/account/logout')
              .then(function(response) {
                $state.go('page.login');
              }, function() {
                $state.go('page.login');
              });
          });
          $scope.$on('$destroy', logOutFunction);
        }
    }
})();
