module.exports = (function () {
  const mongoose = require('mongoose')
  const express = require('express')
  const bodyParser = require('body-parser')
  const cookieParser = require('cookie-parser')
  const session = require('cookie-session')
  const methodOverride = require('method-override')
  const errorHandler = require('errorhandler')
  const pass = require('./authenticate')
  const hbs = require('hbs')
  const middleware = require('./controllers/middleware')
  const AWS = require('aws-sdk')
  const path = require('path')

  require('./helpers/events') // Register event listeners

  const dashboardRouter = require('./routes/dashboard')
  const downloadRouter = require('./routes/download')
  const questionnairesRouter = require('./routes/questionnaire')
  const usersRouter = require('./routes/users')
  const responsesRouter = require('./routes/responses')
  const authRouter = require('./routes/auth')
  const publicRouter = require('./routes/public')

  AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION
  })

  console.log('Using database ' + process.env.MONGO_URI)

  // Connect to the Database
  mongoose.connect(process.env.MONGO_URI)

  var app = express()

  app.enable('trust proxy')

  app.use(methodOverride())
  app.use(bodyParser({
    limit: '50mb'
  }))
  app.disable('x-powered-by')
  app.use(cookieParser())
  app.use(session({
    keys: ['SomethingHereForSession', 'SomethingElseHereForSession']
  }))
  app.use(pass.initialize())
  app.use(pass.session())
  app.use(express.static(path.join(__dirname, '/public')))
  app.set('view engine', 'html')
  app.engine('html', require('hbs').__express)
  app.set('views', __dirname)
  app.use(errorHandler({
    dumpExceptions: true,
    showStack: true
  }))

  // a middleware with no mount path; gets executed for every request to the app
  app.use(function (req, res, next) {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    res.setHeader('Expires', '-1')
    res.setHeader('Pragma', 'no-cache')
    next()
  })

  hbs.registerHelper('toJSON', function (obj) {
    return JSON.stringify(obj)
  })

  hbs.registerHelper('versionNo', function () {
    var packageJSON = require('./package.json')
    return packageJSON.version
  })

  hbs.registerHelper('getStaticUrl', function () {
    return process.env.S3_URL
  })

  app.use('/', publicRouter)

  // Dashboard
  app.use('/api/dash/', dashboardRouter)

  // Download
  app.use('/api/', downloadRouter)

  // Questionnaire
  app.use('/api/questionnaires/', questionnairesRouter)

  // Responses
  app.use('/api/questionnaires/', responsesRouter)

  // Users
  app.use('/api/users/', usersRouter)

  // Response media
  app.get('/api/media/:mid', function (req, res, next) {
    res.redirect(process.env.S3_URL + '/uploads/' + req.params.mid)
  })

  // Response media
  app.get('/api/map/', middleware.map)

  // Login / auth routes
  app.use('/api/account/', authRouter)

  // Error handling
  app.use(function (err, req, res, next) {
    if (process.env.DEBUG === 'true') {
      console.error('error', err)
      if (err.stack) {
        console.error(err.stack)
      }
    }
    if (!err) return res.sendStatus(500)
    if (!res.headersSent) {
      res.sendStatus(400)
    }
  })

  return app
})()
