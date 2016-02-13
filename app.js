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

  //Public redirects
  app.get('/questionnaires/', function(req,res){res.redirect("/app/#/page/questionnaires")})
  app.get('/questionnaires/:id', function(req,res){
    if(req.headers['User-Agent'].indexOf('LandscapeConnect') !== -1){
      return routes.questionnaires.read(req, res)
      //return res.redirect("/api/questionnaires/" + req.params.id)
    }
    //Check if the request is from the app and redirect
    return res.redirect("/app/#/page/questionnaires/" + req.params.id)
  })

  //Dashboard
  app.get('/api/dash/rating/average', middleware.ensureAuthenticated, routes.dashboard.dashboard_rating_average)
  app.get('/api/dash/rating/months', middleware.ensureAuthenticated, routes.dashboard.dashboard_rating_by_month)
  app.get('/api/dash/responses/week', middleware.ensureAuthenticated, routes.dashboard.dashboard_views_week)
  app.get('/api/dash/responses/months', middleware.ensureAuthenticated, routes.dashboard.dashboard_views_by_month)
  app.get('/api/dash/responses/total', middleware.ensureAuthenticated, routes.dashboard.dashboard_views_total)
  app.get('/api/dash/responses/words', middleware.ensureAuthenticated, routes.dashboard.dashboard_words)
  app.get('/api/dash/responses/latest', middleware.ensureAuthenticated, routes.dashboard.dashboard_rating_average)

  //Download
  app.post('/api/questionnaires/download/csv/', middleware.ensureAuthenticated, routes.download.views_download_csv)
  app.post('/api/questionnaires/download/kmz/', middleware.ensureAuthenticated, routes.download.views_download_kmz)
  app.post('/api/questionnaires/download/images/', middleware.ensureAuthenticated, routes.download.views_download_images)
  app.get('/api/questionnaires/:id/download/kmz', middleware.ensureAuthenticated, routes.download.view_download_kmz)
  app.get('/api/questionnaires/:id/download/image', middleware.ensureAuthenticated, routes.download.view_download_image)

  //Questionnaire
  app.get('/api/questionnaires', routes.questionnaires.list)
  app.get('/api/questionnaires/:id', routes.questionnaires.read)
  app.get('/api/questionnaires/:id/qr', routes.questionnaires.qr)
  app.delete('/api/questionnaires/:id', middleware.ensureAuthenticated, routes.questionnaires.remove)
  app.post('/api/questionnaires/:id', middleware.ensureAuthenticated, routes.questionnaires.update)
  app.post('/api/questionnaires/', middleware.check_nonce, multipart, middleware.saveUploadedFile, routes.questionnaires.create)


  //Responses
  app.get('/api/questionnaires/:id/responses', routes.responses.list)
  app.post('/api/questionnaires/:id/responses', multipart, routes.responses.create)

  //Users
  app.get('/api/users', middleware.ensureAuthenticated, routes.users.list)
  app.get('/api/users/:id', middleware.ensureAuthenticated, routes.users.read)
  app.post('/api/users/:id', middleware.ensureAuthenticated, multipart, routes.users.edit)
  app.delete('/api/users/:id', middleware.ensureAuthenticated, routes.users.remove)

  //User login
  app.get('/api/account/details/', middleware.ensureAuthenticated, routes.users.me)
  app.get('/api/account/menu/', middleware.ensureAuthenticated, routes.users.menu)
  app.post('/api/account/logout', middleware.ensureAuthenticated, routes.authenticate.logout)
  app.post('/api/account/register', routes.users.register)
  app.post('/api/account/login', function(req,res,next){
      pass.authenticate(
        'local',
        function (err, user, info) {
          if(err) return res.sendStatus(401)
          if(!user) return res.sendStatus(401)
          req.logIn(user, function(err) {
            if (err) { return next(err); }
            app.emit('user.login')
            res.sendStatus(200) // Authentication successful. Redirect home.
          });
        }
      )(req, res, next)
    }
  )

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
