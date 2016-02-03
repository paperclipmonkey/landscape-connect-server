// requires MongoDb 2.6 or higher!
module.exports = (function () {
  var mongoose = require('mongoose')
  var express = require('express')
  var fs = require('fs')
  var bodyParser = require('body-parser')
  var multipart = require('connect-multiparty')()
  var cookieParser = require('cookie-parser')
  var session = require('cookie-session')
  var methodOverride = require('method-override')
  var errorHandler = require('errorhandler')
  var pass = require('./authenticate')
  var hbs = require('hbs')
  var middleware = require('./routes/middleware')
  var AWS = require('aws-sdk')
  var common = require('./common')
  var eventServer = require('./eventemitter')

  AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION
  })

  var routes = {
    authenticate: require('./routes/authenticate')(app),
    dashboard: require('./routes/dashboard')(app),
    download: require('./routes/download')(app),
    users: require('./routes/users')(app),
    questionnaires: require('./routes/questionnaires')(app),
    responses: require('./routes/responses')(app)
  }

  console.log('Using database ' + process.env.MONGO_URI)

  // Connect to the Database
  mongoose.connect(process.env.MONGO_URI)

  var app = express()

  eventServer.on('view:create', function (view) {
    common.emailAdmins(view)
  })

  if (process.env.DEBUG === 'true') {
    eventServer.on('user:login', function (a, b) {
      console.log('Logged in')
    })

    eventServer.on('view:creating', function (view) {
      console.log('New view being created')
    })

    eventServer.on('view:error', function (err) {
      console.error(err)
    })

    // Catch all email events
    eventServer.on('email:*', function (info) {
      console.log('email event recieved: ', info)
    })
  }

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
  app.use(express['static'](__dirname + '/public'))
  app.set('view engine', 'html')
  app.engine('html', require('hbs').__express)
  app.set('views', __dirname)
  app.use(errorHandler({
    dumpExceptions: true,
    showStack: true
  }))

  hbs.registerHelper('toJSON', function (obj) {
    return JSON.stringify(obj)
  })

  hbs.registerHelper('versionNo', function () {
    var packageJSON = require('./package.json')
    return packageJSON.version
  })

  function renderSelect (arr, val) {
    var ret = ''
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === val) {
        ret += "<option selected='selected'>" + arr[i] + '</option>'
      } else {
        ret += '<option>' + arr[i] + '</option>'
      }
    }
    return ret
  }

  hbs.registerHelper('getStaticUrl', function () {
    return process.env.S3_URL
  })

  app.get('/api/dash/rating/average', middleware.ensureAuthenticated, routes.dashboard.dashboard_rating_average)
  app.get('/api/dash/rating/months', middleware.ensureAuthenticated, routes.dashboard.dashboard_rating_by_month)
  app.get('/api/dash/views/week', middleware.ensureAuthenticated, routes.dashboard.dashboard_views_week)
  app.get('/api/dash/views/months', middleware.ensureAuthenticated, routes.dashboard.dashboard_views_by_month)
  app.get('/api/dash/views/total', middleware.ensureAuthenticated, routes.dashboard.dashboard_views_total)
  app.get('/api/dash/views/words', middleware.ensureAuthenticated, routes.dashboard.dashboard_words)
  app.get('/api/dash/views/latest', middleware.ensureAuthenticated, routes.dashboard.dashboard_rating_average)


  app.post('/api/questionnaires/download/csv/', middleware.ensureAuthenticated, routes.download.views_download_csv)
  app.post('/api/questionnaires/download/kmz/', middleware.ensureAuthenticated, routes.download.views_download_kmz)
  app.post('/api/questionnaires/download/images/', middleware.ensureAuthenticated, routes.download.views_download_images)
  app.get('/api/questionnaires/:id/download/kmz', middleware.ensureAuthenticated, routes.download.view_download_kmz)
  app.get('/api/questionnaires/:id/download/image', middleware.ensureAuthenticated, routes.download.view_download_image)

  app.get('/api/questionnaires', middleware.ensureAuthenticated, routes.questionnaires.list)
  app.get('/api/questionnaires/:id', middleware.ensureAuthenticated, routes.questionnaires.read)
  app.get('/api/questionnaires/:id/qr', middleware.ensureAuthenticated, routes.questionnaires.qr)
  app.delete('/api/questionnaires/:id', middleware.ensureAuthenticated, routes.questionnaires.remove)
  app.post('/api/questionnaires/:id', middleware.ensureAuthenticated, routes.questionnaires.update)
  app.post('/api/questionnaires/', middleware.check_nonce, multipart, middleware.saveUploadedFile, routes.questionnaires.create)


  app.get('/api/users', middleware.ensureIsSuper, routes.users.list)
  app.get('/api/users/:id', middleware.ensureAuthenticated, routes.users.read)
  app.post('/api/users/:id', middleware.ensureAuthenticated, multipart, routes.users.edit)
  app.delete('/api/users/:id', middleware.ensureAuthenticated, routes.users.remove)


  app.get('/api/view/', routes.responses.list)
  app.get('/api/account/details/', routes.users.me)
  app.get('/api/account/menu/', routes.users.menu)
  app.get('/api/view/:id', routes.responses.read)

  app.post('/api/account/logout', routes.authenticate.logout)

  app.post('/api/account/register', routes.users.register)
  app.post('/api/account/login',
    pass.authenticate(
      'local', {
        failureRedirect: '/api/account/login',
        failureFlash: true
      }),
    function (req, res) {
      app.emit('user.login')
      res.redirect('/api/account/details/') // Authentication successful. Redirect home.
    }
  )

  // Error handling
  app.use(function (err, req, res, next) {
    if (!err) return next()
    if (process.env.DEBUG === 'true') {
      console.error(err)
      if (err.stack) {
        console.error(err.stack)
      }
    }
    if (!res.headersSent) {
      res.sendStatus(400)
    }
  })

  return app
})()