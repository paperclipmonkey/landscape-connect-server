var mongoose = require('mongoose')
var async = require('async')
var common = require('../common')
var path = require('path')

module.exports = function (app) {
  var objName = "User"
  var modelName = "user"

  var register = function (req, res, next) {
    var iModel = mongoose.model(modelName)
    var k = new iModel(req.body)//TODO - clean user input
    k.save(function (err) {
      if (err) {
        if(err.code == 11000){
          return res.send('That email address is already register. Do you want to sign in instead?')
        }
        return next(err)
      }
      return next()
    })
  }

  var me = function (req, res, next) {
    res.json({account:req.user});
  }

  var menu = function (req, res, next) {
    var menu = [
      {
        "text": "Main Navigation",
        "heading": "true"
      },
      {
        "text": "Dashboard",
        "sref": "app.dashboard",
        "icon": "icon-speedometer"
      },
      {
        "text": "Questionnaires",
        "sref": "app.questionnaires",
        "icon": "icon-note"
      },
      {
        "text": "Documentation",
        "sref": "app.documentation",
        "icon": "icon-graduation"
      }
    ]

    if(req.user.isSuper){
      menu.push({
        "text": "Users",
        "sref": "app.users",
        "icon": "icon-people"
      })
    }

    res.json(menu)
  }

  var list = function (req, res, next) {
    mongoose.model(modelName).find({}).skip(0).limit(1000).exec(function (err, docs) {
      if (err) {
        return next(err)
      }
      res.json(docs)
    })
  }

  var read = function (req, res, next) {
    mongoose.model(modelName).findOne({_id: req.params.id}, function (err, doc) {
      if (err) return next(err)
      if(!doc) return sendStatus(404)
      res.json(doc)
    })
  }

  var edit = function (req, res, next) {
    var iModel = mongoose.model(modelName)
    //uploadFiles(req, req.params.id, function (err) {
    //  if (err) { return callback(err) }
      mongoose.model(modelName).findOne({_id: req.params.id}, function (err, doc) {
        if (err) return next(err)
        doc.set(req.body)
        doc.save()
        res.json(results.user)
      })
    //})
  }

  var remove = function (req, res, next) {
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
    remove: remove
  }
}
