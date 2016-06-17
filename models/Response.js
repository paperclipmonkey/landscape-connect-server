var mongoose = require('mongoose')
var Schema = mongoose.Schema
require('datejs')

/*
  timestamp // - MS since epoch
  lat // - Number
  lng // - Number
  locAcc // - In metres
  questionnaireQuickCode // - Id of questionnaire
  media // - URL for S3
  data //JSON value for the data returned
*/

module.exports = (function (app) {
  var NSchema = new Schema({
    timestamp: {type: Number},
    lat: {type: Number},
    lng: {type: Number},
    locAcc: {type: Number}, // m
    questionnaire: {type: String},
    media: [String], // URL
    data: {type: Object}
  })

  return mongoose.model('response', NSchema)
})()
