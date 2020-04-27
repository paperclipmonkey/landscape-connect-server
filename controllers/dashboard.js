const mongoose = require('mongoose')

require('date-utils')

module.exports = function (app) {
  const resModel = mongoose.model('response')
  const qreModel = mongoose.model('questionnaire')

  const questionnairesTotal = function (req, res, next) {
    var cback = function (err, results) {
      if (err) {
      }
      res.json({ result: results })
    }

    if (req.user.isSuper) {
      qreModel.where({}).count(cback)
    } else {
      qreModel.where('owner', req.user._id).count(cback)
    }
  }

  const responsesTotal = function (req, res, next) {
    var cback = function (err, results) {
      if (err) {
      }
      res.json({ result: results })
    }

    if (req.user.isSuper) {
      resModel.where({}).count(cback)
    } else {
      qreModel.find({ owner: req.user._id }, 'serverId', function (err, questionnaires) {
        if (err) console.log(err)
        var k = questionnaires.map(function (o) { return o.serverId })
        resModel.where('questionnaire').in(k).count(cback)
      })
    }
  }

  const events = function (req, res, next) {
    var cback = function (err, results) {
      if (err) {
        console.log(err)
        return res.sendStatus(400)
      }
      res.json({ result: results })
    }

    // if(req.user.isSuper){
    //  resModel.find({},'', cback)
    // } else {
    qreModel.find({ owner: req.user._id }, 'serverId', function (err, questionnaires) {
      if (err) console.log(err)
      var k = questionnaires.map(function (o) { return o.serverId })
      resModel.where('questionnaire').in(k).sort({ timestamp: 'desc' }).limit(100)
        .exec(cback)
    })
    // }
  }

  const responsesLatest = function (req, res, next) {
    var limit = 10
    var cback = function (err, results) {
      if (err) {
      }
      res.json({ result: results })
    }

    if (req.user.isSuper) {
      resModel.where({}).limit(limit).exec(cback)
    } else {
      qreModel.find({ owner: req.user._id }, '_id', function (err, questionnaires) {
        if (err) console.log(err)
        var k = questionnaires.map(function (o) { return o._id.toString() })
        resModel.where('questionnaire').in(k).limit(limit).exec(cback)
      })
    }
  }

  return {
    questionnaires_total: questionnairesTotal,
    responses_total: responsesTotal,
    responses_latest: responsesLatest,
    events: events
  }
}
