/**=========================================================
 * Module: questionnaireNewCtrl.js
 * Controller for questionnaireNews
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('app.questions')
        .controller('questionnaireNewCtrl', questionnaireNewCtrl);
    /*jshint -W055 */
    questionnaireNewCtrl.$inject = ['$scope', '$http', '$state'];//'ui-sortable'
    
    function questionnaireNewCtrl($scope, $http, $state) {
      window.myScope = $scope
      $scope.questionnaire = {
        'name': '',
        'description': '',
        'publicQuestionnaire': true,
        'publicData': true,
        'sections': [
          {
            'title': 'Sample Section 1',
            'sectionId': 'lnnder',
            'questions': [
              {
                title: 'Example Multi Select',
                questionId: 'ovgdfq',
                type: 'multi',
                choices: [
                  {
                    choice: 'Example choice 1'
                  },
                  {
                    choice: 'Another example choice 2'
                  }
                ]
              },
              {
                title: 'Example Multiline Textarea',
                questionId: 'qjmyzw',
                type: 'textarea'
              }
            ]
          },
          {
            'title': 'Sample Section 2',
            'sectionId': 'swghrp',
            'questions': [
              {
                title: 'Second Multi Select',
                questionId: 'ilxkxu',
                type: 'multi',
                choices: [
                  {
                    choice: 'Example choice'
                  },
                  {
                    choice: 'Another example choice'
                  }
                ]
              }
            ]
          }
        ]
      }
      $scope.selectedSection = $scope.questionnaire.sections[0]
      $scope.selectedQuestion = null

      $scope.choiceToAdd = ''
      $scope.sectionToAdd = ''

      var sectionTemplate = {
        'title': 'Section title',
        'sectionId': '',
        'questions': []
      }

      var questionPrototypes = [
        {
          title: 'Single Select',
          type: 'radio',
          choices: [
            {
              choice: 'Example single choice'
            },
            {
              choice: 'Another example single choice'
            }
          ]
        },
        {
          title: 'Multi Select',
          type: 'multi',
          choices: [
            {
              choice: 'Example choice'
            },
            {
              choice: 'Another example choice'
            }
          ]
        },
        {
          title: 'Multiline Textarea',
          type: 'textarea'
        },
        {
          title: 'Single Text Line',
          type: 'text'
        }
      ]

      function generateId(){
        var length = 6
        var str = ''
        while(str.length < length){
          var rand = Math.ceil(Math.random()*36)
          str += 'abcdefghijklmnopqrstuvwxyz'.substring(rand, rand + 1)
        }
        return str
      }

      $scope.checkDuplicateQuestion = function(a,b){
        //Loop through selected section
        var count = 0
        for (var i = $scope.selectedSection.questions.length - 1; i >= 0; i--) {
          var item = $scope.selectedSection.questions[i]
          if(item.title === a){
            count++
          }
        }
        if(count > 1){//We have a duplicate
          alert("Please use a unique question name")
        }
      }

      $scope.checkDuplicateSection = function(a,b){
        //Loop through sections
        var count = 0
        for (var i = $scope.questionnaire.sections.length - 1; i >= 0; i--) {
          var item = $scope.questionnaire.sections[i]
          if(item.title === a){
            count++
          }
        }
        if(count > 1){//We have a duplicate
          alert("Please use a unique section name")
        }
      }

      $scope.draggables = questionPrototypes.map(function (x) {
        return [x]
      })

      $scope.populateOptions = [];

      $scope.populatePopulationOptions = function(){
        $http.get("/api/questionnaires/").success(function(data, status) {
            console.log(data.result)
            $scope.populateOptions = data.result;
            //$scope.selectedQuestionnaire = $scope.populateOptions[0]
        })
      }

      $scope.selectedQuestionnaire = {};


      // $scope.$watch("", function(oldo,newo){
      //   console.log(oldo, newo)
      //   console.log('selected Questionnaire')
      // }, true);

      // $scope.$watch('selectedQuestionnaire',
      // function () {
      //           return $scope.selectedQuestionnaire.quickCode;
      //       },
      // function() {
      //   console.log('hey, selected Questionnaire changed has changed!', $scope.selectedQuestionnaire);
      // }, true);

      $scope.selectQuestionnaire = function(a){
        console.log("Selected")
        console.log($scope.selectedQuestionnaire)
      }

      $scope.deselectQuestion = function () {
        $scope.selectedQuestion = null
      }

      $scope.selectQuestion = function (a) {
        if ($scope.selectedQuestion === a) {
          $scope.deselectQuestion()
        } else {
          $scope.selectedQuestion = a
        }
      }

      $scope.removeOption = function (el, i) {
        var index = el.choices.indexOf(i)
        el.choices.splice(index, 1)
      }

      $scope.removeQuestion = function (el) {
        $scope.deselectQuestion()
        var index = $scope.selectedSection.questions.indexOf(el)
        $scope.selectedSection.questions.splice(index, 1)
      }

      $scope.addOption = function () {
        $scope.selectedQuestion.choices.push({choice: this.choiceToAdd})
        this.choiceToAdd = ''
      }

      $scope.addSection = function () {
        var section = angular.copy(sectionTemplate)
        section.title = this.sectionToAdd
        section.sectionId = generateId()
        $scope.questionnaire.sections.push(section)
        $scope.selectedSection = section
        this.sectionToAdd = ''
      }

      $scope.sectionClick = function (a) {
        if ($scope.selectedSection === a) {
          $scope.deselectSection()
        } else {
          $scope.selectedSection = a
          $scope.selectedQuestion = null
        }
      }

      $scope.deselectSection = function () {
        $scope.selectedSection = null
        $scope.selectedQuestion = null
      }

      $scope.removeSection = function (el) {
        var index = $scope.questionnaire.sections.indexOf(el)
        $scope.questionnaire.sections.splice(index, 1)
        $scope.deselectSection()
      }

      $scope.newQuestionClick = function (a) {
        var newEl = angular.copy(a)
        newEl.questionId = generateId()
        $scope.selectedSection.questions.push(newEl)
        $scope.selectedQuestion = newEl
      }

      $scope.submitQuestionnaire = function(a){
        console.log("Submitting Questionnaire")
        $http.post("/api/questionnaires/", $scope.questionnaire).success(function(data, status) {
            console.log(data, status)
            $state.go('app.questionnaire', {questionnaireId: data.serverId})
        })
      }

      $scope.sectionOptions = {}

      $scope.questionOptions = {}

      $scope.import = function (json) {
        $scope.questionnaire.sections = json.sections
        $scope.$apply()
      }

      $scope.export = function () {
        console.log($scope.questionnaire)
      }

      var activate = function() {
        $scope.populatePopulationOptions()
        // BootstrapTour is not compatible with z-index based layout
        // so adding position:static for this case makes the browser
        // to ignore the property
        var section = angular.element('.wrapper > section');
        section.css({'position': 'static'});
        // finally restore on destroy and reuse the value declared in stylesheet
        // $scope.$on('$destroy', function(){
        //   section.css({'position': ''});
        // });
      }

      activate();
    }
})();
