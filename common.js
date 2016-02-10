module.exports = (function () {
  var mongoose = require('mongoose')
  var s3Client = require('./s3-client')
  var mailer = require('./mailer')
  var request = require('request')
  var AWS = require('aws-sdk')
  var fs = require('fs')
  var base64 = require('base64-stream')
  var stream = require('stream')
  var eventServer = require('./eventemitter')

  function getQueryLocations (userAreas, cback) {
    if (!cback) { return }
    if (!userAreas.length) { return cback(null, {}) }
    mongoose.model('area').find({_id: {$in: userAreas}}, function (err, areas) {
      if (err) {
        cback(err, null)
      }
      var query = { // Sample - "type" : "MultiPoint", "coordinates" : [ [ 87.9259315145841, 63.65550362431469 ] , [ 88.9259315145841, 64.65550362431469 ] ] } } )
        '$geoWithin': {
          '$geometry': {
            type: 'MultiPolygon',
            coordinates: []
          }
        }
      }
      for (var q = 0; q < areas.length; q++) {
        var thisArea = areas[q].loc.toObject()
        // Problem with this is that it could either be a Polygon or Multipolygon. Multi needs to be pulled apart
        if (thisArea.type === 'MultiPolygon') {
          query['$geoWithin']['$geometry']['coordinates'].push.apply(
            query['$geoWithin']['$geometry']['coordinates'],
            thisArea.coordinates
          )
        } else {
          query['$geoWithin']['$geometry']['coordinates'].push(
            thisArea.coordinates
          )
        }
      }
      cback(null, query)
    })
  }

  /*
  ##Downloads a file from the S3 Data service
  Responds with a byte stream
  Works with an evented system based on top of the Node.js Stream API
  */
  function downloadFromS3 (filename) {
    var s3Params = {
      Bucket: process.env.S3_BUCKET,
      Key: filename
    }
    var downloader = s3Client.downloadStream(s3Params)

    // downloader.on('error', function (err) {
    //   console.error('unable to download from S3:', err.stack)
    // })

    // downloader.on('progress', function () {
    // console.log("progress", downloader.progressMd5Amount,
    // downloader.progressAmount, downloader.progressTotal)
    // })

    // downloader.on('end', function () {
    // console.log("done downloading from S3")
    // })
    return downloader
  }

  function saveStreamToS3 (key, stream, done) {
    // Upload Stream to S3 with correct filename
    var s3obj = new AWS.S3({params: {
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ACL: 'public-read'
    }})

    s3obj.upload({Body: stream})
      .send(function (err, data) {
        if (done) {
          done(err)
        }
      })
  }

  function saveFileToS3 (key, filename, done) {
    var readStream = fs.createReadStream(filename)
    // This will wait until we know the readable stream is actually valid before piping
    readStream.on('open', function () {
      // This just pipes the read stream)
      saveStreamToS3(key, readStream, done)
    })

    // This catches any errors that happen while creating the readable stream (usually invalid names)
    readStream.on('error', function (err) {
      done(err)
    })
  }

  function saveB64ToS3 (key, b64String, done) {
    // Create a Stream from the string
    var s = new stream.Readable()
    s._read = function noop () {}
    s.push(b64String)
    s.push(null)

    // Pipe Stream in to decoder
    var decoder = s.pipe(base64.decode())

    saveStreamToS3(key, decoder, done)
  }

  function saveUrlToS3 (url, key, callback) {
    request({
      url: url,
      encoding: null
    }, function (err, res, body) {
      if (err) return callback(err, res)

      var s3 = new AWS.S3()

      s3.putObject({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: res.headers['content-type'],
        ContentLength: res.headers['content-length'],
        Body: body // buffer
      }, callback)
    })
  }

  var emailAdmins = function (view) {
    // Create a list of users to email
    // All super admins that have asked to be emailed
    // Add users that are related to the submission area that have asked to be emailed

    function queryBack (err, users) {
      if (err) {
        return
      }
      users.forEach(function (user) {
        sendNewViewEmail(user, view)
      })
    }

    // Super admins
    mongoose.model('user').find({isSuper: true, emailOn: true}, queryBack)

    // perform geoquery on areas - finding areas that the view relates to. Lookup area in users.
    var geoQuery = {
      '$geoIntersects': {
        '$geometry': view.loc
      }
    }

    mongoose.model('area').find({loc: geoQuery}, function (err, areas) {
      if (err) {
        return
      }

      // make array of area ids
      var areaIds = []
      areas.forEach(function (area) {
        areaIds.push(area._id.toString())
      })

      mongoose.model('user').find({isSuper: false, emailOn: true, areas: {$in: areaIds}}, queryBack)
    })
  }

  var sendNewViewEmail = function (user, view) {
    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: 'RmV Team <contact@ratemyview.co.uk>', // sender address
      to: user.email, // list of receivers
      subject: 'New view added', // Subject line
      text: 'A new view has been uploaded to Rate my View. You can check it out here: http://ratemyview.co.uk/admin/views/' + view.id // plaintext body
    // html: '<b>Hello world ✔</b>' // html body
    }

    // send mail with defined mailer object
    mailer.sendMail(mailOptions, function (err, info) {
      if (err) {
        return console.log(err)
      }
      eventServer.emit('email:sent', null, info)
    })
  }

  function resizeImage (inS, size, done) {
    // check err
    done()
  }

  // Check if file exists on S3
  function s3KeyExists (filename, done) {
    var s3Params = {
      Bucket: process.env.S3_BUCKET,
      Key: filename
    }
    var s3 = new AWS.S3()
    s3.headObject(s3Params, function (err, metadata) {
      if (err) {
        return done(false)
      }
      return done(true)
    })
  }

  return {
    getQueryLocations: getQueryLocations,
    saveStreamToS3: saveStreamToS3,
    saveFileToS3: saveFileToS3,
    saveB64ToS3: saveB64ToS3,
    downloadFromS3: downloadFromS3,
    saveUrlToS3: saveUrlToS3,
    emailAdmins: emailAdmins,
    resizeImage: resizeImage,
    s3KeyExists: s3KeyExists
  }
})()
