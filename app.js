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

  if (process.env.LOGGING === 'true') {
    // eventServer.on('user:login', function (a, b) {
    //   console.log('Logged in')
    // })

    // eventServer.on('Response:creating', function (view) {
    //   console.log('New response being created')
    // })

    // eventServer.on('Response:error', function (err) {
    //   console.error(err)
    // })

    // eventServer.on('Response:*', function (data) {
    //   console.log(data)
    // })

    // // Catch all email events
    // eventServer.on('email:*', function (info) {
    //   console.log('email event recieved: ', info)
    // })
    eventServer.on('*', function (a, b) {
      console.log(a, b)
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

  function loginFunction (req, res, next) {
    pass.authenticate(
      'local',
      function (err, user, info) {
        if (err) return res.sendStatus(401)
        if (!user) return res.sendStatus(401)
        req.logIn(user, function (err) {
          if (err) { return next(err); }
          app.emit('user.login')
          res.sendStatus(200) // Authentication successful. Redirect home.
        })
      }
    )(req, res, next)
  }

  hbs.registerHelper('getStaticUrl', function () {
    return process.env.S3_URL
  })

  // Public redirects
  app.get('/questionnaires/', function (req, res) {res.redirect('/app/#/page/questionnaires')})
  app.get('/questionnaires/:id', function (req, res) {
    if (req.headers['user-agent'] && req.headers['user-agent'].indexOf('LandscapeConnect') !== -1) {
      return routes.questionnaires.read(req, res)
    }
    // Check if the request is from the app and redirect
    return res.redirect('/app/#/page/questionnaires/' + req.params.id)
  })

  // Dashboard
  app.get('/api/dash/questionnaires/total', middleware.ensureLoggedIn, routes.dashboard.questionnaires_total)
  app.get('/api/dash/responses/total', middleware.ensureLoggedIn, routes.dashboard.responses_total)
  app.get('/api/dash/responses/latest', middleware.ensureLoggedIn, routes.dashboard.responses_latest)
  app.get('/api/dash/events', middleware.ensureLoggedIn, routes.dashboard.events)

  // Download
  app.get('/api/questionnaires/:id/download/csv', middleware.ensurePublicOrAuthenticated, routes.download.download_csv)
  app.get('/api/questionnaires/:id/download/kmz', middleware.ensurePublicOrAuthenticated, routes.download.download_kmz)
  app.get('/api/questionnaires/:id/download/media', middleware.ensurePublicOrAuthenticated, routes.download.download_media)

  // Questionnaire
  app.get('/api/questionnaires', middleware.ensureLoggedIn, routes.questionnaires.list)
  app.get('/api/questionnaires/public', routes.questionnaires.list_public)
 
  app.get('/api/questionnaires/:id', routes.questionnaires.read)
  app.get('/api/questionnaires/:id/qr', routes.questionnaires.qr)
  app.delete('/api/questionnaires/:id', middleware.ensureLoggedIn, middleware.ensureIsOwner, routes.questionnaires.remove)
  app.post('/api/questionnaires/:id', middleware.ensureLoggedIn, middleware.ensureIsOwner, routes.questionnaires.update)
  app.post('/api/questionnaires/', routes.questionnaires.create)

  // Response media
  app.get('/api/map/', middleware.map)

  // Response media
  app.get('/api/media/:mid', function(req, res, next){
    res.redirect(process.env.S3_URL + '/uploads/' + req.params.mid)
  })

  // Responses
  app.get('/api/questionnaires/:id/responses', routes.responses.list)

  app.get('/api/questionnaires/:id/statistics', middleware.ensurePublicOrAuthenticated, routes.responses.statistics)

  app.get('/api/questionnaires/:qid/responses/:id', middleware.ensurePublicOrAuthenticated, routes.responses.read)
  app.delete('/api/questionnaires/:qid/responses/:id', middleware.ensureIsOwner, routes.responses.remove)
  app.post('/api/questionnaires/:id/responses', multipart, middleware.saveUploaded, routes.responses.create)

  // Users
  app.get('/api/users', middleware.ensureIsSuper, routes.users.list)
  app.get('/api/users/:id', middleware.ensureIsOwner, routes.users.read)
  app.post('/api/users/:id', middleware.ensureIsOwner, multipart, routes.users.edit)
  app.post('/api/users/:id/password', middleware.ensureIsOwner, multipart, routes.users.editpassword)
  app.delete('/api/users/:id', middleware.ensureIsOwner, middleware.ensureIsOwner, routes.users.remove)

  // User login
  app.get('/api/account/details/', middleware.ensureLoggedIn, routes.users.me)
  app.get('/api/account/menu/', middleware.ensureLoggedIn, routes.users.menu)
  app.post('/api/account/logout', middleware.ensureLoggedIn, routes.authenticate.logout)
  app.post('/api/account/register', routes.users.register, loginFunction)
  app.post('/api/account/login', loginFunction)

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
