/**=========================================================
 * Module: questionnaires.controller.js
 * Controller for questionnairess
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('app.users')
        .controller('settingsCtrl', settingsCtrl);
    /*jshint -W055 */
    settingsCtrl.$inject = ['$scope', '$http', '$resource', '$timeout', 'usersDataService', '$stateParams'];

    function settingsCtrl($scope, $http, $resource, $timeout, dataService, $stateParams) {
        window.myScope = $scope

        var userId = 'me'

        if($stateParams.userId != null){
          userId = $stateParams.userId
        }

        $http.get("/api/users/" + userId).success(function(data, status) {
          $scope.user = data;
        })

        $scope.update = function(a){
          $http.post("/api/users/" + userId, {username: $scope.user.username, email: $scope.user.email}).then(
            function(resp) {
              $.notify({message:'updated',status:'success'})
            },
            function(resp){
              $.notify({message:'something went wrong \n Please try again', status:'danger'})
            }
          )
        }

        $scope.updatePassword = function(a){
          $http.post("/api/users/" + userId + "/password", {currentPassword: $scope.password.currentPassword, newPassword: $scope.password.newPassword}).then(
            function(resp) {
              $.notify({message:'password successfully updated',status:'success'})
            }, function(resp){
              $.notify({message:'something went wrong \n Please try again', status:'danger'})
            }
          )
        }

        $scope.delete = function(a){
            $http.delete("/api/users/me").success(function(data, status) {
                $state.go('page.login')
            })
        }
    }
})();


