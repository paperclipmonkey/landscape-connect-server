module.exports = (function () {
  var s3Client = require('./s3-client')
  var request = require('request')
  var AWS = require('aws-sdk')
  var fs = require('fs')

  /**
   * Convert response from storage format to outputting format
   * @param {*} response
   * @param {*} questionnaire
   */
  function formatResponse (response, questionnaire) {
    for (var i = questionnaire.sections.length - 1; i >= 0; i--) {
      var section = questionnaire.sections[i]
      for (var x = section.questions.length - 1; x >= 0; x--) {
        var question = section.questions[x]
        section.questions[x] = {
          title: section.questions[x].title,
          answer: getQuestionResponse(response, section.sectionId, question.questionId)
        }
      }
    }
    response.data = questionnaire.sections
    return response
  }

  /**
   * Lookup answers to questions
   * @param {*} response
   * @param {*} sectionId
   * @param {*} questionId
   */
  var getQuestionResponse = function (response, sectionId, questionId) {
    try {
      return response.data[sectionId][questionId]
    } catch (e) {

    }
  }

  /**
  * Downloads a file from the S3 Data service.
  * Responds with a byte stream.
  * Works with an evented system based on top of the Node.js Stream API.
  */
  function downloadFromS3 (filename) {
    var s3Params = {
      Bucket: process.env.S3_BUCKET,
      Key: filename
    }
    var downloader = s3Client.downloadStream(s3Params)

    downloader.on('error', function (err) {
      console.error('Unable to download from S3', err)
      this.end()
    })
    return downloader
  }

  /**
   * Upload Stream to S3 with correct filename
   * @param {*} key
   * @param {*} stream
   * @param {function} done
   */
  function saveStreamToS3 (key, stream, done) {
    var s3obj = new AWS.S3({
      params: {
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ACL: 'public-read'
      }
    })

    s3obj.upload({ Body: stream })
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
      // This just pipes the read stream
      saveStreamToS3(key, readStream, done)
    })

    // This catches any errors that happen while creating the readable stream (usually invalid names)
    readStream.on('error', function (err) {
      done(err)
    })
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
    formatResponse: formatResponse,
    saveStreamToS3: saveStreamToS3,
    saveFileToS3: saveFileToS3,
    downloadFromS3: downloadFromS3,
    saveUrlToS3: saveUrlToS3,
    s3KeyExists: s3KeyExists
  }
})()
