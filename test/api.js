var app = require('../app')
var request = require('supertest')
var server
var users = {
  'super': {email: 'me@me.com', password: 'mememe'},
  'nonsuper': {email: 'example+nonsuper@sample.com', password: 'pwordme'}
}

describe('Back-end admin', function () {
  var rAgent
  before(function (done) {
    server = app.listen(process.env.PORT, function () {
      rAgent = request.agent(app)
      // Delete all areas with name test - Unique test on Area names
      var mongoose = require('mongoose')
      var Questionnaire = mongoose.model('questionnaire')
      Questionnaire.remove({'name': 'test'}, function () {
        var User = mongoose.model('user')
        User.remove({'email': 'test@test.com'}, done)
      })
    })
  })

  /* - - - - - - - - - Super Admin - - - - - - */
  it('GET /api/account/details should give unauthorised', function (done) {
    rAgent
      .get('/api/account/details')
      .expect(401, done)
  })

  it('POST /api/account/login with wrong password should not login', function (done) {
    rAgent
      .post('/api/account/login')
      .send({email: users.super.email, password: users.super.password + "1"})
      .expect(401, done)
  })

  it('POST /api/account/login should login & set cookie', function (done) {
    rAgent
      .post('/api/account/login')
      .send(users.super)
      .expect(200, done)
  })

  it('GET /api/account/details should give account details', function (done) {
    rAgent
      .get('/api/account/details')
      .expect(200, done)
  })

  it('POST /api/account/menu?v=1455048449138 should return menu items', function (done) {
    rAgent
      .get('/api/account/menu')
      .expect(200)
      .expect(/\bMain Navigation\b/, done)
  })  

  /* - - - - Users - - - - - */

  it('GET /api/users should show users', function (done) {
    rAgent
      .get('/api/users/')
      .expect(/\bemail\b/, done)
  })

  var userAdr

  it('POST /api/account/register/ should add new user', function (done) {
    rAgent
      .post('/api/account/register/')
      .send({
        fullname: 'test',
        email: 'test@test.com',
        organisation: 'Test',
        phoneno: '01792',
        password: 'test'
      })
      .expect(200)
      .end(function (err, res) {
        userAdr = res.header.location
        done(err)
      })
  })

  // it('POST /api/users/:id/ with photo should update user photo', function (done) {
  //   this.timeout(5000)
  //   rAgent
  //     .post(userAdr)
  //     .attach('image', __dirname + '/data/example.jpg', 'photo.jpg')
  //     .send({
  //       fullname: 'test',
  //       email: 'test@test.com',
  //       organisation: 'Test',
  //       phoneno: '01792',
  //       password: 'test'
  //     })
  //     .expect(200)
  //     .end(function (err, res) {
  //       done(err)
  //     })
  // })

  it("POST /api/account/register/ without password shouldn't add new user", function (done) {
    rAgent
      .post('/api/users/new/')
      .send({
        fullname: 'test',
        email: 'test@test2.com',
        organisation: 'Test',
        phoneno: '01792'
      })
      .expect(400, done)
  })

  // it('GET /api/users/:id should show user', function (done) {
  //   rAgent
  //     .get(userAdr)
  //     .expect(200)
  //     .expect(/\btest\b/, done)
  // })

  // it('POST /api/users/:id should edit user', function (done) {
  //   rAgent
  //     .post(userAdr)
  //     .send({
  //       fullname: 'test',
  //       email: 'test2@test.com',
  //       organisation: 'Test',
  //       phoneno: '01792'
  //     })
  //     .expect(200)
  //     .expect(/\btest2@test.com\b/, done)
  // })

  // it("GET /api/users/invalid shouldn't show user", function (done) {
  //   rAgent
  //     .get('/api/users/invalid')
  //     .expect(404, done)
  // })

  // it('DELETE /api/users/x should delete new user', function (done) {
  //   rAgent
  //     .delete(userAdr)
  //     .expect(200)
  //     .expect(/^((?!test).)*$/, done)
  // })

  // it('DELETE /api/users/invalid should return error', function (done) {
  //   rAgent
  //     .delete('/api/users/invalid')
  //     .expect(404, done)
  // })

  /* - - - - - Different Users - - - - - - */

  function runAs (userLogin) {
    describe('login: ' + userLogin.username, function () {
      it('POST /api/account/login should login & set cookie', function (done) {
        rAgent
          .post('/api/account/login')
          .send(userLogin)
          .expect(200, done)
      })

      /* - - - - - - Questionnaires - - - - - */
      it('GET /api/questionnaires should show private questionnaires', function (done) {
        rAgent
          .get('/api/questionnaires/')
          .expect(200)
          .expect(/\bresult\b/, done)
      })

      it('GET /api/questionnaires/:id with wrong id should give 404', function (done) {
        rAgent
          .get('/api/questionnaires/:id')
          .expect(404, done)
      })

      /* - - - - Dashboard - - - - - */
      // it('GET /api/dash/rating/average should show average rating', function (done) {
      //   rAgent
      //     .get('/api/dash/rating/average')
      //     .expect(200, done)
      // })

      // it('GET /api/dash/rating/months should show months rating', function (done) {
      //   rAgent
      //     .get('/api/dash/rating/months')
      //     .expect(200, done)
      // })

      // it('GET /api/dash/responses/week should show total responses this week', function (done) {
      //   rAgent
      //     .get('/api/dash/responses/week')
      //     .expect(200, done)
      // })

      // it('GET /api/dash/responses/average should show total responses this month', function (done) {
      //   rAgent
      //     .get('/api/dash/responses/months')
      //     .expect(200, done)
      // })

      // it('GET /api/dash/responses/total should show total responses', function (done) {
      //   rAgent
      //     .get('/api/dash/responses/total')
      //     .expect(200, done)
      // })

      // it('GET /api/dash/responses/latest should show latest responses', function (done) {
      //   rAgent
      //     .get('/api/dash/responses/latest')
      //     .expect(200, done)
      // })

      it('POST /api/account/logout should logout & delete cookie', function (done) {
        rAgent
          .post('/api/account/logout')
          .expect(200, done)
      })

    })
  }

  // Super Admin
  runAs(users.super)
  // Normal Admin
  
  //TODO - Add non-super used
  //runAs(users.nonsuper)

  /* - - - - Non-Super admin - - - - - */
  it('POST /api/account/login as non-super should login & set cookie', function (done) {
    rAgent
      .post('/api/account/login')
      .send(users.nonsuper)
      .expect(200, done)
  })

  // it("GET /api/users as non-super shouldn't show users", function (done) {
  //   rAgent
  //     .get('/api/users/')
  //     .expect(302, done)
  // })

  after(function () {
    server.close()
  })
})
