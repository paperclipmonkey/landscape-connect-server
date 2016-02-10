var app = require('../app')
var request = require('supertest')
var server

describe('Front-end', function () {
  var rAgent
  before(function (done) {
    server = app.listen(process.env.PORT, function () {
      rAgent = request.agent(app)
      done()
    })
  })

  /* - - - - Front-end - - - - - */

  it("GET / should show front-end website", function (done) {
    rAgent
      .get('/')
      .expect(200)
      .expect(/\bLandscape Connect\b/, done)
  })

  after(function () {
    server.close()
  })
})