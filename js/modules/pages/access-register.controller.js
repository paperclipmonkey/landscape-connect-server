/**=========================================================
 * Module: access-register.js
 * Demo for register account api
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('RegisterFormController', RegisterFormController);

    RegisterFormController.$inject = ['$http', '$state'];
    function RegisterFormController($http, $state) {
        var vm = this;

        activate();

        ////////////////

        function activate() {
          // bind here all data from the form
          vm.account = {};
          // place the message if something goes wrong
          vm.authMsg = '';
            
          vm.register = function() {
            vm.authMsg = '';

            if(vm.registerForm.$valid) {

              $http
                .post('/api/account/register', {email: vm.account.email, password: vm.account.password, username: vm.account.username})
                .then(function(response) {
                  console.log("Signup response data: ", response)
                  //Check against status code
                  //If 200 then redirect to dashboard.
                  //If !200 then display message directly
                  if (response.status === 200) {
                    $state.go('app.dashboard');
                  }else{
                    vm.authMsg = response.data;
                  }
                }, function() {
                  vm.authMsg = 'Server Error';
                });
            }
            else {
              // set as dirty if the user click directly to login so we show the validation messages
              /*jshint -W106*/
              vm.registerForm.account_email.$dirty = true;
              vm.registerForm.account_password.$dirty = true;
              vm.registerForm.account_agreed.$dirty = true;
              
            }
          };
        }
    }
})();
