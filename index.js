var app = require('./app')

var server = app.listen(process.env.PORT, function () {
  console.log('Listening on port %d', server.address().port)
})
