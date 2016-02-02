module.exports = (function (app) {
  var nodemailer = require('nodemailer')

  // create reusable transporter object using SMTP transport
  var transporter = nodemailer.createTransport({
    host: 'smtp.mailgun.org',
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  return transporter
})()
