var mongoose = require('mongoose')
var Schema = mongoose.Schema
require('datejs')

module.exports = (function (app) {
  var FeedbackSchema = new Schema({
    nonce: {type: String},
    rating: {
      type: Number,
      required: true,
      enum: [0, 1, 2, 3, 4, 5]
    },
    heading: {
      type: Number,
      'default': 0
    },
    loc: {
      coordinates: {
        type: [],
        required: true
      },
      'type': {
        type: String,
        required: true,
        enum: ['Point', 'LineString', 'Polygon'],
        'default': 'Point'
      }
    },
    photo: {type: String, 'default': ''},
    age: {
      type: String,
      required: true,
      enum: ['0-18', '19-24', '25-44', '45-64', '65+']
    },
    knowarea: {
      type: String,
      required: true,
      enum: ['Very well', 'Not very well', 'Not at all']
    },
    words: {
      type: Array,
      required: true
    },
    comments: {type: String, 'default': ''},
    ts: {type: Date, 'default': Date.now},
    display: {type: Boolean, 'default': true}
  })

  FeedbackSchema.index({ loc: '2dsphere' })

  FeedbackSchema.pre('save', function (next) {
    this.heading = Math.round(this.heading)
    next()
  })

  FeedbackSchema.method('toClient', function () {
    var obj = this.toObject()
    obj.ts = Date.parse(obj.ts).toString('dd-MM-yyyy')
    obj.time = Date.parse(this.ts).toString('hh:mm')

    obj.loc = obj.loc.coordinates

    obj.id = obj._id
    delete obj._id
    return obj
  })

  FeedbackSchema.method('toCsv', function () {
    var obj = this.toClient()
    obj.lat = obj.loc[1]
    obj.lng = obj.loc[0]

    obj.date = obj.ts
    delete obj.ts

    obj.words = obj.words.toString()
    // Rename fields
    delete obj.loc
    return obj
  })
  return mongoose.model('feedback', FeedbackSchema)
})()
