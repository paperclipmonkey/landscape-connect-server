var app = require('../app')
var request = require('supertest')
var server
var users = {
  'super': {email: 'me@me.com', password: 'mememe', isSuper: true, id: '575eeb9322137beca74f77b4'},
  'nonsuper': {email: 'example+nonsuper@sample.com', password: 'pwordme', isSuper: false, id: '575eeb9322137beca74f77b4'}
}
var questionnaires = [
  'AAAAAA'
]

var mongoose = require('mongoose')
var User = mongoose.model('user')
var Questionnaire = mongoose.model('questionnaire')


describe('Logged out user', function () {
  var rAgent
  before(function (done) {
    server = app.listen(process.env.PORT, function () {
      rAgent = request.agent(app)
      // Delete all areas with name test - Unique test on Area names
      Questionnaire.remove({'name': 'test'}, function () {
        User.remove({'email': 'test@test.com'}, done)
      })
    })
  })

  after(function () {
    server.close()
  })

  /* - - - - - - - - - Super Admin - - - - - - */
  it('GET /api/account/details should give unauthorised', function (done) {
    rAgent
      .get('/api/account/details')
      .expect(401, done)
  })

  it('GET /api/account/details should give error', function (done) {
    rAgent
      .get('/api/account/details')
      .expect(401, done)
  })

  it('POST /api/account/menu?v=1455048449138 should error', function (done) {
    rAgent
      .get('/api/account/menu?v=1455048449138')
      .expect(401, done)
  })

  /* - - - - Users - - - - - */

  it('GET /api/users should error', function (done) {
    rAgent
      .get('/api/users/')
      .expect(401, done)
  })

  /* - - - - - - Questionnaires - - - - - */
  it('GET /api/questionnaires shouldnt show questionnaires', function (done) {
    rAgent
      .get('/api/questionnaires/')
      .expect(401, done)
  })

  /* - - - - Dashboard - - - - - */
  it('GET /api/dash/responses/total should error', function (done) {
    rAgent
      .get('/api/dash/responses/total')
      .expect(401, done)
  })

  it('GET /api/dash/responses/latest should error', function (done) {
    rAgent
      .get('/api/dash/responses/latest')
      .expect(401, done)
  })

  it('GET /api/dash/questionnaires/total should error', function (done) {
    rAgent
      .get('/api/dash/questionnaires/total')
      .expect(401, done)
  })

  it('GET /api/users/:superUserId', function (done) {
    rAgent
      .get('/api/users/' + users.super.id)
      .end(function(err, res){
        done()
    })
  })

  it('POST /api/questionnaires/:id Update not logged in', function (done) {
    rAgent
      .post(`/api/questionnaires/${questionnaires[0]}`)
      .expect(401, done)
  })

  it('DELETE /api/questionnaires/:id not logged in', function (done) {
    rAgent
      .delete(`/api/questionnaires/${questionnaires[0]}`)
      .expect(401, done)
  })

  it("GET /api/users as logged out shouldn't show users", function (done) {
    rAgent
      .get('/api/users/')
      .expect(401, done)
  })
})
