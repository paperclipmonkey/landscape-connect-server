var mongoose = require('mongoose')
var Schema = mongoose.Schema
require('datejs')

/*
  timestamp // - MS since epoch
  lat // - Number
  lng // - Number
  locAcc // - In metres
  questionnaireQuickCode // - Id of questionnaire
  photo // - URL for S3
*/

module.exports = (function (app) {
  var NSchema = new Schema({
    timestamp: {type: Number},
    lat: {type: Number},
    lng: {type: Number},
    locAcc: {type: Number},//m
    questionnaire: {type: String},
    photo: {type: String}//URL
  })

  return mongoose.model('response', NSchema)
})()
