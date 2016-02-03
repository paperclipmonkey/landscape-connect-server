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

var schemaName = "questionnaire"

module.exports = (function (app) {
  var NSchema = new Schema({
    name: {type: String},
    quickCode: {type: String, index: { unique: true }},
    description: {type: String},
    publicQuestionnaire: {type: Boolean},
    publicData: {type: Boolean},
    introTitle: {type: String},
    introDescription: {type: String},
    website: {type: String},
    sections: {type: Array},
    owner: {type: String}
  })

  NSchema.pre('save', checkHasQuickCode)

  function checkHasQuickCode(next){
    console.log("Check has code")
    if (!this.quickCode){
      uniqueOrAgain(this, next)
    } else {
      next()
    }
  }

  function uniqueOrAgain(cx, next){
    console.log("Unique or again")
    cx.quickCode = makeid(5);
    mongoose.models[schemaName].findOne({quickCode : cx.quickCode},function(err, obj) {
      if(err) {
          next(err)
      } else if(obj) {
          uniqueOrAgain(cx, next)
      } else {
          next();
      }
    });
  }

  function makeid(length){
    var text = "";
    var possible = "ABCDEF0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    console.log("Code", text)
    return text;
  }

  return mongoose.model(schemaName, NSchema)
})()
