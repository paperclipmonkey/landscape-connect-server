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
    questionnaireNewCtrl.$inject = ['$scope', '$http', '$state', '$stateParams'];//'ui-sortable'
    
    function questionnaireNewCtrl($scope, $http, $state, $stateParams) {
      $scope.questionnaire = {
        'title': '',
        'description': '',
        'publicQuestionnaire': true,
        'publicData': true,
        'getLocation': true,
        'getInitialPhoto': true,
        'getLocationAccuracy': 50,
        'introTitle': "Welcome to the {{title}} questionnaire",
        'introDescription': "Help us to build a picture of the landscape by submitting your responses. This feeds back in to our project.",
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

      $scope.draggables = questionPrototypes.map(function (x) {
        return [x]
      })

      $scope.populateOptions = [];

      $scope.selectedQuestionnaire = {};

      if($stateParams.questionnaireId != false ){
        //Duplicate questionnaire
        $http.get("/api/questionnaires/" + $stateParams.questionnaireId).success(function(data, status) {
            $scope.questionnaire = data
            try{
              delete $scope.questionnaire.serverId
              delete $scope.questionnaire._id
              delete $scope.questionnaire.owner
              delete $scope.questionnaire.__v
              delete $scope.questionnaire.created
              delete $scope.questionnaire.uploadUrl

              $scope.selectedSection = $scope.questionnaire.sections[0]
              $scope.selectedQuestion = null
            } catch(e){}
        })
      }

      $scope.selectQuestionnaire = function(a){
      }

      $scope.deselectQuestion = function () {
        $scope.selectedQuestion = null
      }

      $scope.checkQuestionValid = function(){
        if($scope.selectedQuestion == null){
          return true
        }

        if(!$scope.selectedQuestion.title){
          $scope.errorNotify('Please add a question title')
          return false
        }
        //check if question type is multi or radio. If is, check has enough options
        if($scope.selectedQuestion.type === 'radio'){
          if($scope.selectedQuestion.choices.length <= 2){
            $scope.errorNotify('A single response question must have two or more options')
            return false
          }
        } else if($scope.selectedQuestion.type === 'multi'){
          if($scope.selectedQuestion.choices.length < 2){
            $scope.errorNotify('A multi select question must have one or more options')
            return false
          }
        }
        return true
      }

      $scope.checkQuestionTitleValid = function(){
        if($scope.selectedQuestion == null){
          return true
        }

        if(!$scope.selectedQuestion.title){
          $scope.errorNotify('Please add a question title')
          return false
        }
        return true
      }

      $scope.selectQuestion = function (a) {
        if ($scope.selectedQuestion === a) {
          $scope.deselectQuestion()
        } else {
          $scope.selectedQuestion = a
        }
      }

      $scope.removeOption = function (el, i) {
        if($scope.checkQuestionValid()){
          var index = el.choices.indexOf(i)
          el.choices.splice(index, 1)
        }
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
        $scope.selectedQuestion = null
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

      $scope.checkSectionValid = function(){
        if(!$scope.selectedSection.title){
          $scope.errorNotify('Please add a section title')
          return false
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
        //Check there's a title and description
        if(!$scope.questionnaire.title){
          $scope.errorNotify('Please add a title')
          return
        }

        if(!$scope.questionnaire.description){
          $scope.errorNotify('Please add a description')
          return
        }

        //Add strings to IntroTitle and IntroDescription
        $scope.questionnaire.introTitle = $scope.questionnaire.introTitle.replace('{{title}}', $scope.questionnaire.title)
        $scope.questionnaire.introTitle = $scope.questionnaire.introTitle.replace('{{website}}', $scope.questionnaire.website)

        $scope.questionnaire.introDescription = $scope.questionnaire.introDescription.replace('{{title}}', $scope.questionnaire.title)
        $scope.questionnaire.introDescription = $scope.questionnaire.introDescription.replace('{{website}}', $scope.questionnaire.website)

        $http.post("/api/questionnaires/", $scope.questionnaire).then(function(response) {
            $scope.successNotify("Questionnaire successfully created")
            $state.go('app.questionnaire', {questionnaireId: response.data.serverId})
        }, function(response){
            $scope.errorNotify("Something went wrong. Please try again")
        })
      }

      $scope.errorNotify = function(msg){
        $.notify({message:msg, status:'danger'})
      }

      $scope.successNotify = function(msg){
        $.notify({message:msg, status:'success'})
      }


      $scope.sectionOptions = {}

      $scope.questionsOptions = {}
      $scope.questionOptions = {}

      var activate = function() {
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
