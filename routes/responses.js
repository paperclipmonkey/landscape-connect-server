var mongoose = require('mongoose')
var escape = require('escape-html')
var common = require('../common')
var async = require('async')
var s3Client = require('../s3-client')
var eventServer = require('../eventemitter')

module.exports = function (app) {
  var objName = 'Response'
  var modelName = 'response'

  var create = function (req, res, next) {
    eventServer.emit(objName + ':creating', req.body)

    eventServer.emit(objName + ':creating')
    var toInsert = req.body

    var Model = mongoose.model(modelName)
    var instance = new Model(toInsert)

    if(req.uploadedFileNames){
      instance.media = req.uploadedFileNames
    }

    instance.save(function (err) {
      if (err) {
        eventServer.emit(objName + ':error', err)
        eventServer.emit(instance)
        res.status(400).json(JSON.stringify({'err': err.message}))
        return res.end()
      }

      // Publish event to the system
      eventServer.emit(objName + ':create', instance)

      res.json({status: "success", obj: instance}) // JSON
      res.end()
    })
  }

  var list = function (req, res, next) {
    eventServer.emit(objName + ':list', {})
    var questionnaire
    var cback = function (err, results) {
      if (err) return next(err)
      for (var i = 0; i < results.length; i++) {
        results[i] = common.formatResponse(results[i], questionnaire)
      }
      res.json({'result': results})
    }
    mongoose.model('questionnaire').findOne({serverId: req.params.id}, function (err, docb) {
      questionnaire = docb
      if (req.user && req.user.isSuper) {
        mongoose.model(modelName).find({questionnaire: req.params.id}, cback)
      } else {
        // TODO - check if data is public for this questionnaire
        mongoose.model(modelName).find({questionnaire: req.params.id}, cback) // user: req.user._id
      }
    })
  }

  var remove = function (req, res, next) {
    mongoose.model(modelName).findByIdAndRemove(req.params.id, function (err, doc) {
      if (err) return next(err)
      eventServer.emit(objName + ':delete', doc)
      res.sendStatus(200)
    })
  }

  var read = function (req, res, next) {
    mongoose.model(modelName).findOne({_id: req.params.id}, function (err, doca) {
      if (err) return next(err)
      if (!doca) return res.sendStatus(404)
      mongoose.model('questionnaire').findOne({serverId: doca.questionnaire}, function (err, docb) {
        var doc = common.formatResponse(doca, docb)
        res.send(doc)
      })
    })
  }

  return {
    'create': create,
    'list': list,
    'remove': remove,
    'read': read
  }
}
