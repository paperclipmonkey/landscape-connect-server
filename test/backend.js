var app = require('../app')
var request = require('supertest')
var server
var users = {
  'super': {username: 'glastohacks@gmail.com', password: 'glastonbury'},
  'nonsuper': {username: 'glastohacks+nonsuper@gmail.com', password: 'glastonbury'}
}

describe('Back-end admin', function () {
  var rAgent
  before(function (done) {
    server = app.listen(process.env.PORT, function () {
      rAgent = request.agent(app)
      // Delete all areas with name test - Unique test on Area names
      var mongoose = require('mongoose')
      var Area = mongoose.model('questionnaire')
      Area.remove({'name': 'test'}, function () {
        var User = mongoose.model('user')
        User.remove({'email': 'test@test.com'}, done)
      })
    })
  })

  /* - - - - - - - - - Super Admin - - - - - - */
  it('GET /admin should redirect to login', function (done) {
    rAgent
      .get('/admin/')
      .expect(302, done)
  })

  it('GET /admin/login should give 200', function (done) {
    rAgent
      .get('/admin/login')
      .expect(200, done)
  })

  it('POST /admin/login with wrong password should not login', function (done) {
    rAgent
      .post('/admin/login')
      .send({username: 'glastohacks@gmail.com', password: 'glastonbury11'})
      .expect(302)
      .expect('location', '/admin/login', done)
  })

  it('POST /admin/login should login & set cookie', function (done) {
    rAgent
      .post('/admin/login')
      .send(users.super)
      .expect(302)
      .expect('location', '/admin/', done)
  })

  // it('GET /admin/dash/views/words should show latest words',function(done){
  //   rAgent
  //     .get('/admin/dash/views/words')
  //     .expect(200, done)
  // })

  /* - - - - Users - - - - - */

  it('GET /admin/users should show users', function (done) {
    rAgent
      .get('/admin/users/')
      .expect(/\bEmail\b/, done)
  })

  it('GET /admin/users/new/ should show form', function (done) {
    rAgent
      .get('/admin/users/new/')
      .expect(200)
      .expect(/\bEmail\b/, done)
  })

  var userAdr

  it('POST /admin/users/new/ should add new user', function (done) {
    rAgent
      .post('/admin/users/new/')
      .send({
        fullname: 'test',
        email: 'test@test.com',
        organisation: 'Test',
        phoneno: '01792',
        password: 'test'
      })
      .expect(302)
      .end(function (err, res) {
        userAdr = res.header.location
        done(err)
      })
  })

  // TODO - need a better way of testing this.
  it('POST /admin/users/x/ with photo should update user photo', function (done) {
    this.timeout(5000)
    rAgent
      .post(userAdr)
      .attach('image', __dirname + '/data/example.jpg', 'photo.jpg')
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

  it("POST /admin/users/new/ shouldn't add new user", function (done) {
    rAgent
      .post('/admin/users/new/')
      .send({
        fullname: 'test',
        email: 'test@test.com',
        organisation: 'Test',
        phoneno: '01792'
      })
      .expect(400, done)
  })

  it('GET /admin/users/x should show user', function (done) {
    rAgent
      .get(userAdr)
      .expect(200)
      .expect(/\btest\b/, done)
  })

  it('POST /admin/users/x should edit user', function (done) {
    rAgent
      .post(userAdr)
      .send({
        fullname: 'test',
        email: 'test2@test.com',
        organisation: 'Test',
        phoneno: '01792'
      })
      .expect(200)
      .expect(/\btest2@test.com\b/, done)
  })

  it("GET /admin/users/invalid shouldn't show user", function (done) {
    rAgent
      .get('/admin/users/none')
      .expect(400, done)
  })

  it('DELETE /admin/users/x should delete new user', function (done) {
    rAgent
      .get(userAdr + '/delete')
      .expect(302)
      .expect(/^((?!test).)*$/, done)
  })

  it('DELETE /admin/users/invalid should return error', function (done) {
    rAgent
      .get('/admin/users/unknown' + '/delete')
      .expect(400, done)
  })

  /* - - - - - Different Users - - - - - - */

  function runAs (userLogin) {
    describe('login: ' + userLogin.username, function () {
      it('POST /admin/login should login & set cookie', function (done) {
        rAgent
          .post('/admin/login')
          .send(userLogin)
          .expect(302)
          .expect('location', '/admin/', done)
      })

      /* - - - - - - Views - - - - - */
      it('GET /admin/views should show views', function (done) {
        rAgent
          .get('/admin/views/')
          .expect(200)
          .expect(/\bLocation\b/, done)
      })

      it('GET /admin/views-datatables should return JSON views', function (done) {
        rAgent
          .get('/admin/views-datatables')
          .expect(200)
          // TODO - try parsing as JSON
          .expect(/\baaData\b/, done)
      })

      it('GET /admin/views/:id with wrong id should give 400', function (done) {
        rAgent
          .get('/admin/views/:id')
          .expect(400, done)
      })

      /* - - - - Dashboard - - - - - */
      it('GET /admin/ should show dashboard', function (done) {
        rAgent
          .get('/admin/')
          .expect(200)
          .expect(/\bdashboard\b/, done)
      })

      it('GET /admin/dash/rating/average should show average rating', function (done) {
        rAgent
          .get('/admin/dash/rating/average')
          .expect(200, done)
      })

      it('GET /admin/dash/rating/months should show months rating', function (done) {
        rAgent
          .get('/admin/dash/rating/months')
          .expect(200, done)
      })

      it('GET /admin/dash/views/week should show total views this week', function (done) {
        rAgent
          .get('/admin/dash/views/week')
          .expect(200, done)
      })

      it('GET /admin/dash/views/average should show total views this month', function (done) {
        rAgent
          .get('/admin/dash/views/months')
          .expect(200, done)
      })

      it('GET /admin/dash/views/total should show total views', function (done) {
        rAgent
          .get('/admin/dash/views/total')
          .expect(200, done)
      })

      it('GET /admin/dash/views/latest should show latest views', function (done) {
        rAgent
          .get('/admin/dash/views/latest')
          .expect(200, done)
      })

      it('POST /admin/logout should logout & delete cookie', function (done) {
        rAgent
          .get('/admin/logout')
          .send(users.nonsuper)
          .expect(302)
          .expect('location', '/admin/login', done)
      })

    })
  }

  // Super Admin
  runAs(users.super)
  // Normal Admin
  runAs(users.nonsuper)

  /* - - - - Non-Super admin - - - - - */
  it('POST /admin/login as non-super should login & set cookie', function (done) {
    rAgent
      .post('/admin/login')
      .send(users.nonsuper)
      .expect(302)
      .expect('location', '/admin/', done)
  })

  it("GET /admin/users as non-super shouldn't show users", function (done) {
    rAgent
      .get('/admin/users/')
      .expect(302, done)
  })

  it("GET /admin/users/new/ as non-super shouldn't show form", function (done) {
    rAgent
      .get('/admin/users/new/')
      .expect(400, done)
  })

  it("POST /admin/users/new/ as non-super shouldn't add new user", function (done) {
    rAgent
      .post('/admin/users/new/')
      .send({
        fullname: 'test',
        email: 'test@test.com',
        organisation: 'Test',
        phoneno: '01792',
        password: 'test'
      })
      .expect(400, done)
  })

  it("GET /admin/users/x as non-super shouldn't show user", function (done) {
    rAgent
      .get(userAdr)
      .expect(302, done)
  })

  it("GET /admin/users/invalid as non-super shouldn't show user", function (done) {
    rAgent
      .get('/admin/users/none')
      .expect(400, done)
  })

  /* - - - - Areas - - - - - */

  it("GET /admin/questionnaires as non-super shouldn't show questionnaires", function (done) {
    rAgent
      .get('/admin/questionnaires/')
      .expect(200)
      .expect(/\bAreas\b/, done)
  })

  it("GET /admin/questionnaires/new/ as non-super shouldn't show form", function (done) {
    rAgent
      .get('/admin/questionnaires/new/')
      .expect(400, done)
  })

  it("POST /admin/questionnaires/new/ as non-super shouldn't add new questionnaire", function (done) {
    rAgent
      .post('/admin/questionnaires/new/')
      .send({
        name: 'test',
        twitter: 'test',
        website: 'test',
        loc: '{"coordinates":[[[-4.053811277785324,51.20433457239784],[-4.007597736803445,51.19739941184122],[-3.983156106324372,51.19157260178689],[-3.969179631372659,51.16337330788794],[-3.934741037118132,51.16149973059944],[-3.901256508974158,51.14712397920866],[-3.883183334265228,51.12839023268349],[-3.868934334228307,51.09561861180481],[-3.829000033563197,51.08293431937978],[-3.805015535777541,51.05843527715723],[-3.757645708638051,51.04900406172283],[-3.708601490362808,51.0444745274642],[-3.66713529859512,51.04098433395254],[-3.630689023451794,51.03693248293776],[-3.587082528726521,51.03612120055641],[-3.559864106907772,51.02700515443644],[-3.527487747005998,51.01527725063428],[-3.47000542459968,51.02574398190755],[-3.425718948107913,51.05105427475365],[-3.419051184211735,51.08202064205543],[-3.369616245361678,51.09024332844456],[-3.309589560900005,51.09401567519809],[-3.284057383075013,51.10846840712964],[-3.304903309058935,51.1375969737466],[-3.355666389188158,51.15895541899641],[-3.389709955239067,51.15698295550389],[-3.407657415592152,51.18021629602056],[-3.417455071614844,51.20210071739069],[-3.462733517018304,51.22222291870003],[-3.524540997136634,51.23875785292998],[-3.602202573010662,51.23769907111762],[-3.70703936116741,51.2410310602363],[-3.792458922712144,51.25635521190181],[-3.885188309357289,51.23992618335758],[-3.968217191674391,51.23805773517002],[-4.044344921288225,51.22127197537402],[-4.053811277785324,51.20433457239784]]],"type":"Polygon"}'
      })
      .expect(400, done)
  })

  it("GET /admin/questionnaires/x as non-super shouldn't show questionnaires", function (done) {
    rAgent
      .get(areaAdr)
      .expect(302, done)
  })

  it("DELETE /admin/questionnaires/x as non-super shouldn't delete new questionnaires", function (done) {
    rAgent
      .get(areaAdr + '/delete')
      .expect(302)
      .expect(/^((?!test).)*$/, done)
  })

  it("DELETE /admin/questionnaires/invalid as non-super shouldn't delete", function (done) {
    rAgent
      .get('/admin/questionnaires/unknown' + '/delete')
      .expect(400, done)
  })

  it('GET /admin/questionnaires/api as non-super should return JSON', function (done) {
    rAgent
      .get('/admin/questionnaires/api')
      .expect(200, done)
  })

  /*
  TODO - finish adding queries. Get ID from datatables?
  it('GET /admin/views/:id should return editable view', function (done) {
    rAgent
      .get('/admin/views/:id')
      .expect(400, done)
  })

  it('POST /admin/views/:id should edit view', function (done) {
    rAgent
      .post('/admin/views/:id')
      .send({
        name: 'test',
        twitter: 'test',
        website: 'test',
        loc: '{"coordinates":[[[-4.053811277785324,51.20433457239784],[-4.007597736803445,51.19739941184122],[-3.983156106324372,51.19157260178689],[-3.969179631372659,51.16337330788794],[-3.934741037118132,51.16149973059944],[-3.901256508974158,51.14712397920866],[-3.883183334265228,51.12839023268349],[-3.868934334228307,51.09561861180481],[-3.829000033563197,51.08293431937978],[-3.805015535777541,51.05843527715723],[-3.757645708638051,51.04900406172283],[-3.708601490362808,51.0444745274642],[-3.66713529859512,51.04098433395254],[-3.630689023451794,51.03693248293776],[-3.587082528726521,51.03612120055641],[-3.559864106907772,51.02700515443644],[-3.527487747005998,51.01527725063428],[-3.47000542459968,51.02574398190755],[-3.425718948107913,51.05105427475365],[-3.419051184211735,51.08202064205543],[-3.369616245361678,51.09024332844456],[-3.309589560900005,51.09401567519809],[-3.284057383075013,51.10846840712964],[-3.304903309058935,51.1375969737466],[-3.355666389188158,51.15895541899641],[-3.389709955239067,51.15698295550389],[-3.407657415592152,51.18021629602056],[-3.417455071614844,51.20210071739069],[-3.462733517018304,51.22222291870003],[-3.524540997136634,51.23875785292998],[-3.602202573010662,51.23769907111762],[-3.70703936116741,51.2410310602363],[-3.792458922712144,51.25635521190181],[-3.885188309357289,51.23992618335758],[-3.968217191674391,51.23805773517002],[-4.044344921288225,51.22127197537402],[-4.053811277785324,51.20433457239784]]],"type":"Polygon"}'
      })
      .expect(400, done)
  })
  */

  after(function () {
    server.close()
  })
})
