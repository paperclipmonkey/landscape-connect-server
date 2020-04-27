const app = require('../app')
const request = require('supertest')
let server

describe('Front-end', function () {
  let rAgent
  before(function (done) {
    server = app.listen(process.env.PORT, function () {
      rAgent = request.agent(app)
      done()
    })
  })

  after(function () {
    server.close()
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
})
