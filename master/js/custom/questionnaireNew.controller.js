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
    //questionnaireNewCtrl.$inject = ['ui-sortable'];
    
    function questionnaireNewCtrl() {
      window.$scope = this
      $scope.questionnaire = {
        'dateAdded': '',
        'name': '',
        'description': '',
        'serverId': '',
        'sections': []
      }
      $scope.selectedSection = null
      $scope.selectedQuestion = null

      $scope.choiceToAdd = ''
      $scope.sectionToAdd = ''

      var sectionTemplate = {
        'title': 'Section title',
        'required': false,
        'questions': []
      }

      var questionPrototypes = [
        {
          title: 'Single Select',
          type: 'radio',
          choices: [
            {
              choice: 'example'
            },
            {
              choice: 'another'
            }
          ]
        },
        {
          title: 'Multi Select',
          type: 'multi',
          choices: [
            {
              choice: 'example'
            },
            {
              choice: 'another'
            }
          ]
        },
        {
          title: 'Textarea',
          type: 'textarea'
        },
        {
          title: 'Text',
          type: 'text'
        }
      ]

      $scope.draggables = questionPrototypes.map(function (x) {
        return [x]
      })

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
        var index = $scope.selectedSection.questions.indexOf(el)
        $scope.selectedSection.questions.splice(index, 1)
        $scope.deselectQuestion()
      }

      $scope.addOption = function () {
        $scope.selectedQuestion.choices.push({choice: this.choiceToAdd})
        this.choiceToAdd = ''
      }

      $scope.addSection = function () {
        var section = angular.copy(sectionTemplate)
        section.title = this.sectionToAdd
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
        $scope.selectedSection.questions.push(newEl)
        $scope.selectedQuestion = newEl
      }

      $scope.draggableOptions = {
        connectWith: '.connected-drop-target-sortable',
        stop: function (e, ui) {
          // if the element is removed from the first container
          if (ui.item.sortable.source.hasClass('draggable-element-container') &&
            ui.item.sortable.droptarget &&
            ui.item.sortable.droptarget !== ui.item.sortable.source &&
            ui.item.sortable.droptarget.hasClass('connected-drop-target-sortable')) {
            // restore the removed item
            ui.item.sortable.sourceModel.push(angular.copy(ui.item.sortable.model))
            $scope.selectedQuestion = [ui.item.sortable.model]
          }
        }
      }

      $scope.sectionOptions = {
        stop: function (e, ui) {
          // if the element is removed from the first container
          if (ui.item.sortable.source.hasClass('draggable-element-container') &&
            ui.item.sortable.droptarget &&
            ui.item.sortable.droptarget !== ui.item.sortable.source &&
            ui.item.sortable.droptarget.hasClass('connected-drop-target-sortable')) {
            // restore the removed item
            ui.item.sortable.sourceModel.push(angular.copy(ui.item.sortable.model))
            $scope.selectedQuestion = [ui.item.sortable.model]
          }
        }
      }

      $scope.questionOptions = {
        stop: function (e, ui) {
          // if the element is removed from the first container
          if (ui.item.sortable.source.hasClass('draggable-element-container') &&
            ui.item.sortable.droptarget &&
            ui.item.sortable.droptarget !== ui.item.sortable.source &&
            ui.item.sortable.droptarget.hasClass('connected-drop-target-sortable')) {
            // restore the removed item
            ui.item.sortable.sourceModel.push(angular.copy(ui.item.sortable.model))
            //$scope.selectedQuestion = [ui.item.sortable.model]
          }
        }
      }


      $scope.sortableOptions = {}

      $scope.import = function (json) {
        $scope.questionnaire = json
        $scope.$apply()
      }

      $scope.export = function () {
        console.log($scope.questionnaire)
      }


      ////////////////

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


