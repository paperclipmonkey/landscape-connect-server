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

    instance.dataToKeyVal();

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
    var cback = function (err, results) {
      if (err) return next(err)
      res.json({'result': results})
    }
    if (req.user && req.user.isSuper) {
      mongoose.model(modelName).find({questionnaire: req.params.id}, cback)
    } else {
      // TODO - check if data is public for this questionnaire
      mongoose.model(modelName).find({questionnaire: req.params.id}, cback) // user: req.user._id
    }
  }

  var remove = function (req, res, next) {
    mongoose.model(modelName).findByIdAndRemove(req.params.id, function (err, doc) {
      if (err) return next(err)
      eventServer.emit(objName + ':delete', doc)
      res.redirect('/admin/views')
    })
  }

  var update = function (req, res, next) {
    mongoose.model(modelName).findOneAndUpdate({_id: req.params.id}, req.body, {'new': true}, function (err, doc) {
      if (err) return next(err)
      res.json(results.view)
      eventServer.emit(objName + ':update', doc)
    })
  }

  var read = function (req, res, next) {
    mongoose.model(modelName).findOne({_id: req.params.id}, function (err, doc) {
      if (err) return next(err)
      if (!doc) return sendStatus(404)
      res.send(doc)
    })
  }

  return {
    'create': create,
    'list': list,
    'remove': remove,
    'update': update,
    'read': read
  }
}
