var mongoose = require('mongoose')
var escape = require('escape-html')
var common = require('../common')
var async = require('async')
var s3Client = require('../s3-client')
var eventServer = require('../eventemitter')
var qrLib = require('qr-image')

module.exports = function (app) {
  var objName = "Questionnaire"
  var modelName = "questionnaire"

  var create = function (req, res, next) {
    eventServer.emit(objName + ':creating', instance)
    var toInsert = req.body

    var Model = mongoose.model(modelName)
    var instance = new Model(toInsert)
    instance.save(function (err) {
      if (err) {
        eventServer.emit(objName + ':error', err)
        res.status(400).json(JSON.stringify({'err': err.message}))
        return res.end()
      }

      // Publish event to the system
      eventServer.emit(objName + ':create', instance)

      res.json(instance) // JSON
      res.end()
    })
  }

  function buildQrImgPipe(str){
    var qr_svg = qrLib.image(str, { type: 'png' });
    return qr_svg//.pipe(require('fs').createWriteStream(str.split("/").push() + '.png'));
  }

  var qr = function(req, res, next) {
    mongoose.model(modelName).findOne({_id: req.params.id}, function (err, doc) {
      if (err) return next(err)
      var qr = buildQrImgPipe("http://3equals.co.uk/lc-json/" + req.params.quickCode + ".json")
      qr.pipe(res)
    })
  }


  var list = function (req, res, next) {
    eventServer.emit(objName + ':list',{})
    var cback = function (err, results) {
      if (err) return next(err)
      res.json({"result": results})
    }

    if (req.user.isSuper) {
      mongoose.model(modelName).find({}, cback)
    } else {
      mongoose.model(modelName).find({}, cback)//user: req.user._id
    }
  }

  var remove = function (req, res, next) {
    console.log("Removing")
    mongoose.model(modelName).findByIdAndRemove(req.params.id, function (err, doc) {
      if (err) return next(err)
      eventServer.emit(objName + ':delete', doc)
      console.log("Removed")
      res.sendStatus(200)
    })
  }

  var update = function (req, res, next) {
      mongoose.model(modelName).findOneAndUpdate({_id: req.params.id}, req.body, {'new': true}, function (err, doc) {
          if (err) return next(err)
          eventServer.emit(objName + ':update', doc)
          res.json(doc)
      })
  }

  var read = function (req, res, next) {
    mongoose.model(modelName).findOne({_id: req.params.id}, function (err, doc) {
      if (err) return next(err)
      res.send(doc)
    })
  }

  return {
    'create': create,
    'list': list,
    'remove': remove,
    'update': update,
    'read': read,
    'qr': qr
  }
}