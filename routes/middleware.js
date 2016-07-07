var mongoose = require('mongoose')
var common = require('../common')
var path = require('path')
var async = require('async')

// Sanitise inputs for non admins - This stops them from upgrading their own settings
function sanitiseInput (req) {
  if (req.body && req.body.isSuper) {
    req.body.isSuper = false
  }
}

function randomUUID () {
  var s = []
  var itoh = '0123456789ABCDEF'
  var i

  // Make array of random hex digits. The UUID only has 32 digits in it, but we
  // allocate an extra items to make room for the '-'s we'll be inserting.
  for (i = 0; i < 36; i++) s[i] = Math.floor(Math.random() * 0x10)

  // Conform to RFC-4122, section 4.4
  s[14] = 4 // Set 4 high bits of time_high field to version
  s[19] = (s[19] & 0x3) | 0x8 // Specify 2 high bits of clock sequence

  // Convert to hex chars
  for (i = 0; i < 36; i++) {
    s[i] = itoh[s[i]]
  }

  // Insert '-'s
  s[8] = s[13] = s[18] = s[23] = '-'

  return s.join('')
}

//Save all files uploaded to server
//Use media as variable name in 
function saveUploaded (req, res, next) {
  var folder = 'uploads/'
  var acceptedExtensions = ['.jpg', '.jpeg', '.mp3', '.aac', '.png', '.tiff']
  
  //Loop over files in files
  if (req.files && req.files) {
    req.uploadedFileNames = []
    async.forEachOf(req.files, function(item, key, callback){
      var originalExt = path.extname(item.name).toLowerCase()
      // Check file extension is kosher
      if (acceptedExtensions.indexOf(originalExt) === -1) {
        console.log('Uploading with wrong extension:' + originalExt)
        return callback(new Error("Wrong extension"))
      }
      var newFilename = randomUUID() + originalExt
      req.uploadedFileNames.push(newFilename)
      common.saveFileToS3(folder + newFilename, item.path, callback)
    }, function(err){
      if(err) console.log("Error uploading", err)
      return next()
    })
  } else {
    return next()
  }
}

function ensureIsSuper (req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user && req.user.isSuper) {
      return next()
    }
  }
  return res.sendStatus(401)
}

function ensureIsOwner (req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user && req.user.isSuper) {
      return next()
    }
    //Me
    if(req.params.id === 'me'){
      return next()
    }
    //User object
    if(req.params.id === req.user._id){
      return next()
    }
    //Questionnaire object
    mongoose.model('questionnaire').findOne({owner: req.user._id, serverId: req.params.id}, function (err, questionnaire) {
      if (questionnaire != null) {
        return next()
      }
      return res.sendStatus(401)
    })
  } else {
    return res.sendStatus(401)
  }
}

function ensurePublicOrAuthenticated (req, res, next) {
  if (req.user && req.user.isSuper) {
    return next()
  }
  mongoose.model('questionnaire').findOne({serverId: req.params.id}, function (err, questionnaire) {
    if(questionnaire != null){
      if (questionnaire.owner === req.user._id) {//Owned by logged in user
        return next()
      }
      if (questionnaire.publicData === true) {//Public data
        return next()
      }
    }
    return res.sendStatus(401)
  })
}

function ensureLoggedIn (req, res, next) {
  if (req.user != null) {
    return next()
  }
  return res.sendStatus(401)
}

module.exports = {
  saveUploaded: saveUploaded,
  ensureLoggedIn: ensureLoggedIn,
  ensureIsSuper: ensureIsSuper,
  ensurePublicOrAuthenticated: ensurePublicOrAuthenticated,
  ensureIsOwner: ensureIsOwner
}
