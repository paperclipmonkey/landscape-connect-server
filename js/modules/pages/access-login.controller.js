/**=========================================================
 * Module: access-login.js
 * Demo for login api
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('LoginFormController', LoginFormController);

    LoginFormController.$inject = ['$http', '$state'];
    function LoginFormController($http, $state) {
        var vm = this;

        activate();

        ////////////////

        function activate() {
          // bind here all data from the form
          vm.account = {};
          // place the message if something goes wrong
          vm.authMsg = '';

          $http
            .get('/api/account/details')
            .then(function(response) {
              if(!response.data.account){
                return;
              }
              $state.go('app.dashboard');
            });

          vm.login = function() {
            vm.authMsg = '';

            if(vm.loginForm.$valid) {

              $http
                .post('/api/account/login', {email: vm.account.email, password: vm.account.password})
                .then(function(response) {
                  // assumes if ok, response is an object with some data, if not, a string with error
                  // customize according to your api
                  //if ( !response.data.account ) {
                  //  vm.authMsg = 'Incorrect credentials.';
                  //}else{
                    $state.go('app.dashboard');
                  //}
                }, function() {
                  $.notify({message:"We didn't recognise those details. Please try again", status:'danger'})
                });
            }
            else {
              // set as dirty if the user click directly to login so we show the validation messages
              /*jshint -W106*/
              vm.loginForm.account_email.$dirty = true;
              vm.loginForm.account_password.$dirty = true;
            }
          };
        }
    }
})();
