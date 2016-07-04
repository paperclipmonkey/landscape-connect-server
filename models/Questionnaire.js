var mongoose = require('mongoose')
var Schema = mongoose.Schema
require('datejs')

/*
"dateAdded": 1446587339,
  "title": "Natural England",
  "serverId": "FGHH21",
  "description": "Natural England landscape questionnaire. This uses the Landscape Connect technology",
  "publicQuestionnaire": true,
  "publicData": true,
  "introTitle": "Add new landscape",
  "introDescription": "Welcome to the Natural England questionnaire. \n Let us walk you through the steps of sharing your landscape with us.",
  "website": "http://www.google.co.uk/",
  "created: "8765432345678",
  "sections": [
*/

var schemaName = 'questionnaire'

module.exports = (function (app) {
  var NSchema = new Schema({
    title: {type: String},
    serverId: {type: String, index: { unique: true }},
    description: {type: String},
    publicQuestionnaire: {type: Boolean},
    publicData: {type: Boolean},
    getLocation: {type: Boolean, default: true},
    getLocationAccuracy: {type: Number, default: 50},//Metres
    getInitialPhoto: {type: Boolean, default: true},
    introTitle: {type: String},
    introDescription: {type: String},
    introImage: {type: String}, // B64 image
    website: {type: String},
    sections: {type: Array},
    owner: { type: Schema.Types.ObjectId, ref: 'user' },
    created: {type: Date, default: Date.now},
    uploadUrl: {type: String}
  })

  NSchema.pre('save', checkHasserverId)

  function checkHasserverId (next) {
    if (!this.serverId) {
      uniqueOrAgain(this, next)
    } else {
      next()
    }
  }

  function uniqueOrAgain (cx, next) {
    cx.serverId = makeid(5)
    mongoose.models[schemaName].findOne({serverId: cx.serverId}, function (err, obj) {
      if (err) {
        next(err)
      } else if (obj) {
        uniqueOrAgain(cx, next)
      } else {
        //Create uploadUrl now we have a Unique ID
        cx.uploadUrl = process.env.SITE_URL + '/api/questionnaires/' + cx.serverId + '/responses/'
        next()
      }
    })
  }

  function makeid (length) {
    var text = ''
    var possible = 'ABCDEF0123456789'

    for ( var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    return text
  }

  return mongoose.model(schemaName, NSchema)
})()
