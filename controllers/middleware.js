var mongoose = require('mongoose')
var common = require('../common')
var path = require('path')
var async = require('async')
var s3Client = require('../s3-client')

// Sanitise inputs for non admins - This stops them from upgrading their own settings
// function sanitiseInput (req) {
//   if (req.body && req.body.isSuper) {
//     req.body.isSuper = false
//   }
// }

/**
 * Generate a random ID
 * Used for IDs
 */
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

/**
 * Save all files uploaded to server
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Function} next
 */
function saveUploaded (req, res, next) {
  var folder = 'uploads/'
  var acceptedExtensions = ['.jpg', '.jpeg', '.mp3', '.aac', '.png', '.tiff']

  // Loop over files in files
  if (req.files && req.files) {
    req.uploadedFileNames = []
    async.forEachOf(req.files, function (item, key, callback) {
      var originalExt = path.extname(item.name).toLowerCase()
      // Check file extension is kosher
      if (acceptedExtensions.indexOf(originalExt) === -1) {
        console.log('Uploading with wrong extension:' + originalExt)
        return callback(new Error('Wrong extension'))
      }
      var newFilename = randomUUID() + originalExt
      req.uploadedFileNames.push(newFilename)
      common.saveFileToS3(folder + newFilename, item.path, callback)
    }, function (err) {
      if (err) console.log('Error uploading', err)
      return next()
    })
  } else {
    return next()
  }
}

/**
 * Ensures the request is logged in and a super user
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Function} next
 */
function ensureIsSuper (req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user && req.user.isSuper) {
      return next()
    }
  }
  return res.sendStatus(401)
}

/**
 * Ensure is owner of requested resource, or super
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Function} next
 */
function ensureIsOwner (req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user && req.user.isSuper) {
      return next()
    }
    // Me. Performing update on user.
    if (req.params.id === 'me') {
      return next()
    }
    // Performing ID based update on user.
    if (req.params.id === req.user._id) {
      return next()
    }
    // Questionnaire object
    mongoose.model('questionnaire').findOne({ owner: req.user._id, serverId: req.params.id }, function (err, questionnaire) {
      if (err) console.log(err)
      if (questionnaire != null) {
        return next()
      }
      return res.sendStatus(401)
    })
  } else {
    return res.sendStatus(401)
  }
}

/**
 * Check Questionnaire is public or owned.
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Function} next
 */
function ensurePublicOrAuthenticated (req, res, next) {
  if (req.user && req.user.isSuper) {
    return next()
  }
  mongoose.model('questionnaire').findOne({ serverId: req.params.id }, function (err, questionnaire) {
    if (err) console.log(err)
    if (questionnaire != null) {
      if (req.user != null && questionnaire.owner === req.user._id) { // Owned by logged in user
        return next()
      }
      if (questionnaire.publicData === true) { // Public data
        return next()
      }
    }
    return res.sendStatus(401)
  })
}

/**
 * Ensure user is logged in
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Function} next
 */
function ensureLoggedIn (req, res, next) {
  if (req.user != null) {
    return next()
  }
  return res.sendStatus(401)
}

// TODO move this from middleware
// TODO update this to RmV Version
/**
 * Get cached map from Google static map API
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Function} next
 */
var map = function (req, res, next) {
  // Check if S3 has image
  // Else download file and upload to S3
  // Redirect user to S3
  var coord = [req.query.lat, req.query.lng]
  // var color = 'green'
  // if (doc.rating < 4) {
  //   color = 'orange'
  // }
  // if (doc.rating < 2) {
  //   color = 'red'
  // }
  var s3Params = {
    Bucket: process.env.S3_BUCKET,
    Key: 'map-thumbs/' + coord[0] + '-' + coord[1] + '.png'
  }
  var downloader = s3Client.downloadStream(s3Params)

  downloader.on('error', function () {
    common.saveUrlToS3(
      // https://maps.googleapis.com/maps/api/staticmap?center=Brooklyn+Bridge,New+York,NY&zoom=13&size=250x170&sensor=false&visual_refresh=true&maptype=roadmap&markers=color:blue%7Clabel:S%7C40.702147,-74.015794&markers=color:green%7Clabel:G%7C40.711614,-74.012318&markers=color:red%7Clabel:C%7C40.718217,-73.998284&key=AIzaSyC_j0J2_IUjBcIJwz5_zCcCYKZbPmXcqBg")

      'https://maps.googleapis.com/maps/api/staticmap?center=' + coord[0] + ',' + coord[1] + '&zoom=10&size=200x200&sensor=false&visual_refresh=true&markers=color:red%7C' + coord[1] + ',' + coord[0] + '&key=AIzaSyC_j0J2_IUjBcIJwz5_zCcCYKZbPmXcqBg',
      s3Params.Key,
      function (err) {
        if (err) return next(err)
        var downloader = s3Client.downloadStream(s3Params)
        downloader.on('error', function (err) {
          return next(err)
        })
        downloader.pipe(res)
      }
    )
  })
  downloader.pipe(res)
}

module.exports = {
  saveUploaded: saveUploaded,
  map: map,
  ensureLoggedIn: ensureLoggedIn,
  ensureIsSuper: ensureIsSuper,
  ensurePublicOrAuthenticated: ensurePublicOrAuthenticated,
  ensureIsOwner: ensureIsOwner
}
