'use strict'
var mongoose = require('mongoose')
var eventServer = require('../eventemitter')
var qrLib = require('qr-image')
var Validator = require('jsonschema').Validator

module.exports = function (app) {
  var objName = 'Questionnaire'
  var modelName = 'questionnaire'

  // Build JSONSchema object
  var lcValidator = new Validator()
  var questionSchema = require('../schema/question-schema')
  var questionnaireSchema = require('../schema/questionnaire-schema')

  // Load the additional schema document
  lcValidator.addSchema(questionSchema, '/Question')

  var create = function (req, res, next) {
    var toInsert = req.body

    // Validate JSON against Schema
    if (lcValidator.validate(toInsert, questionnaireSchema).errors.length > 0) {
      return res.status(400).json({ err: lcValidator.validate(toInsert, questionnaireSchema).errors })
    }

    var Model = mongoose.model(modelName)
    var instance = new Model(toInsert)

    // Questionnaire specific code
    instance.owner = req.user

    // End Specific code

    instance.save(function (err) {
      if (err) {
        eventServer.emit(objName + ':error', err)
        res.status(400).json(JSON.stringify({ err: err.message }))
        return res.end()
      }

      // Publish event to the system
      eventServer.emit(objName + ':create', instance)

      res.json(instance) // JSON
      res.end()
    })
  }

  function buildQrImgPipe (str) {
    return qrLib.image(str, { type: 'png' })
  }

  var qr = function (req, res, next) {
    mongoose.model(modelName).findOne({ serverId: req.params.id }, function (err, doc) {
      if (err) return next(err)
      if (!doc) return next()
      // QR code is to the generic URL. From there depending on the user-agent either the app or JSON is displayed
      var qr = buildQrImgPipe(process.env.SITE_URL + '/questionnaires/' + doc.serverId)
      qr.pipe(res)
    })
  }

  var list = function (req, res, next) {
    eventServer.emit(objName + ':list', {})
    var cback = function (err, results) {
      if (err) return next(err)
      res.json({ result: results })
    }

    if (req.user && req.user.isSuper) {
      mongoose.model(modelName).find({}).populate('owner', 'username _id').exec(cback)
    } else {
      mongoose.model(modelName).find({ owner: req.user._id }).populate('owner', 'username _id').exec(cback)// user: req.user._id // {'owner': req.user._id}
    }
  }

  var listPublic = function (req, res, next) {
    mongoose.model(modelName).find({ publicQuestionnaire: true }).populate('owner', 'username _id').exec(function (err, results) {
      if (err) return next(err)
      res.json({ result: results })
    })
  }

  var remove = function (req, res, next) {
    eventServer.emit(objName + ':delete', req.params.id)
    mongoose.model(modelName).findOneAndRemove({ serverId: req.params.id }, function (err, doc) {
      if (err) return next(err)
      eventServer.emit(objName + ':delete', doc)
      res.sendStatus(200)
    })
  }

  var update = function (req, res, next) {
    mongoose.model(modelName).findOneAndUpdate({ serverId: req.params.id }, req.body, { new: true }, function (err, doc) {
      if (err) {
        return res.status(400).json({ err: 'Failed to update ' + objName })
      }
      eventServer.emit(objName + ':update', doc)
      res.json(doc)
    })
  }

  var read = function (req, res, next) {
    mongoose.model(modelName).findOne({ serverId: req.params.id }).populate('owner', 'username _id').exec(function (err, doc) {
      if (err) return res.sendStatus(400)
      if (!doc) return res.sendStatus(404)

      const doc2 = JSON.parse(JSON.stringify(doc))

      doc2.ownerName = doc2.owner.username
      doc2.ownerId = doc2.owner._id

      res.send(doc2)
    })
  }

  return {
    create: create,
    list: list,
    list_public: listPublic,
    remove: remove,
    update: update,
    read: read,
    qr: qr
  }
}
