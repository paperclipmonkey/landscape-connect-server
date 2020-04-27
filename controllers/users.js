var mongoose = require('mongoose')
var crypto = require('crypto')
var eventServer = require('../eventemitter')

module.exports = function (app) {
  var objName = 'User'
  var modelName = 'user'

  var register = function (req, res, next) {
    var IModel = mongoose.model(modelName)
    var k = new IModel(req.body) // TODO - clean user input
    eventServer.emit(objName + ':create', k)
    k.save(function (err) {
      if (err) {
        if (err.code === 11000) {
          return res.status(400).json({ status: 'error', err: 'That email address is already register. Did you mean to sign in instead?' })
        }
        return next(err)
      }
      return next()
    })
  }

  var me = function (req, res, next) {
    res.json({
      account: {
        email: req.user.email,
        username: req.user.username
      }
    })
  }

  var menu = function (req, res, next) {
    var menu = [
      {
        text: 'Main Navigation',
        heading: 'true'
      },
      {
        text: 'Dashboard',
        sref: 'app.dashboard',
        icon: 'icon-speedometer'
      },
      {
        text: 'Questionnaires',
        sref: 'app.questionnaires',
        icon: 'icon-note'
      },
      {
        text: 'Documentation',
        sref: 'app.documentation',
        icon: 'icon-graduation'
      }
    ]

    if (req.user.isSuper) {
      menu.push({
        text: 'Users',
        sref: 'app.users',
        icon: 'icon-people'
      })
    }

    res.json(menu)
  }

  var list = function (req, res, next) {
    mongoose.model(modelName).find({}, '_id username email lastlogin isSuper').skip(0).limit(1000).exec(function (err, docs) {
      if (err) {
        return next(err)
      }
      res.json({ result: docs })
    })
  }

  var read = function (req, res, next) {
    var uId
    if (req.params.id === 'me') {
      uId = req.user._id
    } else {
      uId = req.params.id
    }
    mongoose.model(modelName).findOne({ _id: uId }, '_id username email lastlogin isSuper', function (err, doc) {
      if (err) return next(err)
      if (!doc) return res.sendStatus(404)
      res.json(doc)
    })
  }

  var editpassword = function (req, res, next) {
    var uId
    if (req.params.id === 'me') {
      uId = req.user._id
    } else {
      uId = req.params.id
    }
    eventServer.emit(objName + ':update', uId)
    mongoose.model(modelName).findOne({ _id: uId }, function (err, doc) {
      if (err) {
        return res.status(400).json({ err: 'Failed to update ' + objName })
      }

      if (!req.user.isSuper) {
        // Check currentPassword is correct
        var shasum = crypto.createHash('sha1')
        shasum.update(doc.salt + '>><<' + req.body.currentPassword) // Salt + >><< + pw = salting
        var oldHash = shasum.digest('hex')

        if (oldHash !== doc.password) {
          return res.status('400').send('Password not correct')
        }
      }

      doc.set({ password: req.body.newPassword })
      doc.save(function (err) {
        if (err) {
          return res.sendStatus(400)
        }
        res.sendStatus(200)
      })
    })
  }

  var edit = function (req, res, next) {
    var uId
    if (req.params.id === 'me') {
      uId = req.user._id
    } else {
      uId = req.params.id
    }
    eventServer.emit(objName + ':update', uId)
    mongoose.model(modelName).findOne({ _id: uId }, function (err, doc) {
      if (err) return next(err)

      var limitedObj = {}

      if (req.body.username) {
        limitedObj.username = req.body.username
        limitedObj.email = req.body.email
      }

      doc.set(limitedObj)
      doc.save(function (err) {
        if (err) {
          return res.status(400).json({ err: 'Failed to update ' + objName })
        }
        res.sendStatus(200)
      })
    })
  }

  var remove = function (req, res, next) {
    eventServer.emit(objName + ':update', req.params.id)
    mongoose.model(modelName).findByIdAndRemove(req.params.id, function (err, docs) {
      if (err) return next(err)
      res.sendStatus(200)
    })
  }

  return {
    register: register,
    me: me,
    menu: menu,
    read: read,
    list: list,
    edit: edit,
    editpassword: editpassword,
    remove: remove
  }
}
