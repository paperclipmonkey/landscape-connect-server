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

  NSchema.methods.dataToKeyVal = function () {
    var df = this.data
    var tData = []
    if(df){
      for(x in df){
        var section = {
          key: x,
          value: []
        }
        console.log('x:' + x)
        for(y in df[x]){
          console.log('y:' + y)
          section.value.push({
            key:y,
            value : df[x][y] 
          })
        }
        tData.push(section)
      }
    }
    console.log('New Data attribute: ', tData)
    this.data = tData
    return this
  }

  NSchema.methods.dataToAttrs = function () {
    var df = this.data
    if(df){
      for(var x = 0; x < df.length; x++){
        for(var y = 0; y < df[x].value.length; y++){
          console.log('y:' + y)
          console.log({[df[x].key + '/' + df[x].value[y].key] : df[x].value[y].value})
          this[df[x].key + '/' + df[x].value[y].key] = df[x].value[y].value
        }
      }
      this.data = '';
    }
    return this
  }

  return mongoose.model('response', NSchema)
})()
