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
    return res.sendStatus(401)
  }
  return res.sendStatus(401)
}

function ensureAuthenticated (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401)
  }

  if (req.user.isSuper) { // If super admin allow access
    return next()
  }

  sanitiseInput(req) // Sanitise inputs for non-admins

  var ids = [] // Id(s) of accessed item(s)

  // See if ID is logged in user ID
  if (req.params.id) {
    ids.push(req.params.id)
  }

  // // Add GET routes with JSON arrays
  // if (req.params.ids) {
  //   try {
  //     ids.concat(JSON.parse(req.params.ids))
  //   } catch (e) {}
  // }

  // // Add POST routes with JSON arrays
  // if (req.body.ids) {
  //   try {
  //     ids.concat(JSON.parse(req.body.ids))
  //   } catch (e) {}
  // }

  // if (!ids) {
  //   return next()
  // }

  // if (ids.indexOf(req.user._id.toString()) !== -1 && ids.length === 1) { // Own profile
  //   return next()
  // }

  return next()
}

var check_nonce = function (req, res, next) {
  // Ensure we have a new view - check NONCE from App
  // if (req.body.nonce) {
  //   // Do lookup in DB for nonce. Does it exist already?
  //   mongoose.model('feedback').find({nonce: req.body.nonce}, function (err, views) {
  //     if (err) {
  //       return res.json(500, err)
  //     }
  //     if (views.length < 1) {
  //       return next()
  //     } else {
  //       res.json(views[0].toClient()) // JSON
  //       return res.end()
  //     }
  //   })
  // } else {
  return next()
// }
}

module.exports = {
  saveUploaded: saveUploaded,
  ensureIsSuper: ensureIsSuper,
  ensureAuthenticated: ensureAuthenticated,
  check_nonce: check_nonce
}
