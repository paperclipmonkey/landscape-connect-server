var mongoose = require('mongoose')
var Schema = mongoose.Schema
require('datejs')

/*
"dateAdded": 1446587339,
  "name": "Natural England",
  "quickCode": "FGHH21",
  "description": "Natural England landscape questionnaire. This uses the Landscape Connect technology",
  "publicQuestionnaire": true,
  "publicData": true,
  "introTitle": "Add new landscape",
  "introDescription": "Welcome to the Natural England questionnaire. \n Let us walk you through the steps of sharing your landscape with us.",
  "serverId": "11",
  "website": "http://www.google.co.uk/",
  "sections": [
*/

module.exports = (function (app) {
  var NSchema = new Schema({
    name: {type: String},
    quickCode: {type: String},
    description: {type: String},
    publicQuestionnaire: {type: Boolean},
    publicData: {type: Boolean},
    introTitle: {type: String},
    introDescription: {type: String},
    serverId: {type: String},
    website: {type: String},
    sections: {type: Array},
  })

  return mongoose.model('questionnaire', NSchema)
})()
