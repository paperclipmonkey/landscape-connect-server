const app = require('../app')
const request = require('supertest')
let server
const users = {
  'super': {email: 'me@me.com', password: 'mememe', isSuper: true, id: '575eeb9322137beca74f77b4'},
  'nonsuper': {email: 'example+nonsuper@sample.com', password: 'pwordme', isSuper: false, id: '575eeb9322137beca74f77b4'}
}

const questionnaireHeaders = {"title":"my Title","description":"my Description","publicQuestionnaire":true,"publicData":true,"getInitialPhoto":true, "getLocationAccuracy": 20, "getLocation": true,"sections":[{"title":"Sample Section 1","sectionId":"lnnder","questions":[{"title":"Example Multi Select","questionId":"ovgdfq","type":"multi","choices":[{"choice":"Example choice 1"},{"choice":"Another example choice 2"}]},{"title":"Example Multiline Textarea","questionId":"qjmyzw","type":"textarea"},{"title":"Single Text Line","type":"text","questionId":"ziwbhc"},{"title":"Single Select","type":"radio","choices":[{"choice":"Example single choice"},{"choice":"Another example single choice"}],"questionId":"pigrve"}]},{"title":"Sample Section 2","sectionId":"swghrp","questions":[{"title":"Second Multi Select","questionId":"ilxkxu","type":"multi","choices":[{"choice":"Example choice"},{"choice":"Another example choice"}]}]}],"website":"http://project.com","introTitle":"intro title","introDescription":"intro description","introImage":"data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAA8AAD/7gAOQWRvYmUAZMAAAAAB/9sAhAAGBAQEBQQGBQUGCQYFBgkLCAYGCAsMCgoLCgoMEAwMDAwMDBAMDg8QDw4MExMUFBMTHBsbGxwfHx8fHx8fHx8fAQcHBw0MDRgQEBgaFREVGh8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx//wAARCAABAAEDAREAAhEBAxEB/8QASgABAAAAAAAAAAAAAAAAAAAAAQEBAAAAAAAAAAAAAAAAAAAABhABAAAAAAAAAAAAAAAAAAAAABEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AAsLf/9k="}

const mongoose = require('mongoose')
const User = mongoose.model('user')
const Questionnaire = mongoose.model('questionnaire')


describe('Back-end admin', function () {
  let rAgent
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

  it('POST /api/account/login with wrong password should not login', function (done) {
    rAgent
      .post('/api/account/login')
      .send({email: users.super.email, password: users.super.password + '1'})
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
        done(err)
      })
  })

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
    describe('login: ' + userLogin.email, function () {
      it('POST /api/account/login should login & set cookie', function (done) {
        rAgent
          .post('/api/account/login')
          .send(userLogin)
          .expect(200, done)
      })

      /* - - - - - - Questionnaires - - - - - */
      it('GET /api/questionnaires should show my private questionnaires', function (done) {
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
      it('GET /api/dash/responses/total should show total rating', function (done) {
        rAgent
          .get('/api/dash/responses/total')
          .expect(200, done)
      })

      it('GET /api/dash/responses/latest should show responses this month', function (done) {
        rAgent
          .get('/api/dash/responses/latest')
          .expect(200, done)
      })

      it('GET /api/dash/questionnaires/total should show total questionnaires', function (done) {
        rAgent
          .get('/api/dash/questionnaires/total')
          .expect(200, done)
      })

      it('GET /api/dash/events should show response events', function (done) {
        rAgent
          .get('/api/dash/events')
          .expect(200, done)
      })

      it('GET /api/map?lat=11&lng=11 should show map', function (done) {
        rAgent
          .get('/api/map?lat=11&lng=11')
          .expect(200, done)
      })

      it('POST /api/questionnaires/ without title should error', function (done) {
        let requestHeaders = JSON.parse(JSON.stringify(questionnaireHeaders));
        delete requestHeaders.title
        rAgent
          .post('/api/questionnaires')
          .send(requestHeaders)
          .expect(400)
          .expect(/\berr\b/, done)
      })

      it('POST /api/questionnaires/ without section title should error', function (done) {
        let requestHeaders = JSON.parse(JSON.stringify(questionnaireHeaders));
        delete requestHeaders.sections[0].title
        rAgent
          .post('/api/questionnaires')
          .send(requestHeaders)
          .expect(400)
          .expect(/\berr\b/, done)
      })

      it('POST /api/questionnaires/ without question title should error', function (done) {
        let requestHeaders = JSON.parse(JSON.stringify(questionnaireHeaders));
        delete requestHeaders.sections[0].questions[0].title
        rAgent
          .post('/api/questionnaires')
          .send(requestHeaders)
          .expect(400)
          .expect(/\berr\b/, done)
      })

      it('POST /api/questionnaires/ should add new questionnaire', function (done) {
        rAgent
          .post('/api/questionnaires')
          .send(questionnaireHeaders)
          .expect(200)
          .expect(/\btitle\b/, done)
      })

      it('POST /api/account/logout should logout & delete cookie', function (done) {
        rAgent
          .post('/api/account/logout')
          .expect(200, done)
      })
    })
  }

  //Get Id of 

  // Super Admin
  runAs(users.super)
  // Normal Admin
  runAs(users.nonsuper)

  function loginAs(userLogin, done){
    rAgent
      .post('/api/account/login')
      .send(userLogin)
      .expect(200, done)
  }

  function checkPermissions (userLogin, expected) {
    describe('check permissions: ' + userLogin.email, function () {

      it('GET /api/users/:superUserId', function (done) {
        rAgent
          .get(`/api/users/${users.super.id}`)
          .end(function(err, res){
            done()
        })
      })

      it('GET /api/questionnaires/:id with questionnaire not mine', function (done) {
        rAgent
          .get('/api/questionnaires/:id')
          .end(function(err, res){
            done()
          })
      })

      it('POST /api/questionnaires/:id Update with id not mine', function (done) {
        rAgent
          .get('/api/questionnaires/:id')
          .expect(404, done)
      })

      it('DELETE /api/questionnaires/:id with id not mine', function (done) {
        rAgent
          .get('/api/questionnaires/:id')
          .expect(404, done)
      })

    })
  }

  checkPermissions(users.super, true)
  checkPermissions(users.nonsuper, false)


  /* - - - - Non-Super admin - - - - - */
  it('POST /api/account/login as non-super should login & set cookie', function (done) {
    rAgent
      .post('/api/account/login')
      .send(users.nonsuper)
      .expect(200, done)
  })

  it("GET /api/users as non-super shouldn't show users", function (done) {
    rAgent
      .get('/api/users/')
      .expect(401, done)
  })
})
