/*
#S3-client
Create a new Amazon S3 client object to re-use inside the application.

This module is not a singleton to avoid issues with multiple uploads at once.
*/
module.exports = (function (app) {
  var s3 = require('s3')

  var client = s3.createClient({
    maxAsyncS3: 20, // this is the default
    s3RetryCount: 5, // this is the default
    s3RetryDelay: 1000, // this is the default
    s3Options: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      region: process.env.S3_REGION
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
    }
  })
  return client
})()
