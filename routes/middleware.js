var mongoose = require('mongoose')
var common = require('../common')
var path = require('path')

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

function saveUploadedFile (req, res, next) {
  var filename = randomUUID() + '.jpg'
  var folder = 'uploads/'
  var acceptedExtensions = ['.jpg', '.jpeg']

  // Uploading in B64 as string
  if (req.body && req.body.photo) {
    var base64Data = req.body.photo
    req.uploadedFileName = filename
    common.saveB64ToS3(folder + filename, base64Data, next)
  } else if (req.files && req.files.image && req.files.image.name) {
    // Check file extension is kosher
    if (acceptedExtensions.indexOf(path.extname(req.files.image.name)) === -1) {
      console.log('Uploading with wrong extension')
      return next(new Error('Wrong file extension'))
    }
    req.uploadedFileName = filename
    common.saveFileToS3(folder + filename, req.files.image.path, next)
  } else {
    return next()
  }
}

function ensureIsSuper (req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.isSuper) {
      return next()
    }
    return res.redirect('/admin/')
  }
  return res.redirect('/admin/login')
}

function ensureAuthenticated (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/admin/login')
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
  if (req.body.nonce) {
    // Do lookup in DB for nonce. Does it exist already?
    mongoose.model('feedback').find({nonce: req.body.nonce}, function (err, views) {
      if (err) {
        return res.json(500, err)
      }
      if (views.length < 1) {
        return next()
      } else {
        res.json(views[0].toClient()) // JSON
        return res.end()
      }
    })
  } else {
    return next()
  }
}

module.exports = {
  saveUploadedFile: saveUploadedFile,
  ensureIsSuper: ensureIsSuper,
  ensureAuthenticated: ensureAuthenticated,
  check_nonce: check_nonce
}
