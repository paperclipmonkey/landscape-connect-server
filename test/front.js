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

  it('GET / should show front-end website', function (done) {
    rAgent
      .get('/')
      .expect(200)
      .expect(/\bLandscape Connect\b/, done)
  })


  it('GET /questionnaires/ should redirect to questionnaires gallery', function (done) {
    rAgent
      .get('/questionnaires/')
      .expect(302, done)
  })

  it('GET /api/questionnaires/public/ should return questionnaires gallery JSON', function (done) {
    rAgent
      .get('/api/questionnaires/public/')
      .expect(200, done)
  })

  after(function () {
    server.close()
  })
})
