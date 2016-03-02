var app = require('../app')
var request = require('supertest')
var server

describe('Responses', function () {
  var rAgent,
    testQId

  before(function (done) {
    server = app.listen(process.env.PORT, function () {
      rAgent = request.agent(app)
      // Delete all areas with name test - Unique test on Area names
      var mongoose = require('mongoose')
      var Questionnaire = mongoose.model('questionnaire')
      Questionnaire.findOne({'name': 'Test'}, function (err, qaire) {
        if (err) return done(err)
        if (!qaire) return done(new Error('No questionnaire'))
        testQId = qaire.serverId
        done()
      })
    })
  })

  it('POST /api/questionnaires/x/responses should save new response', function (done) {
    rAgent
      .post('/api/questionnaires/' + testQId + '/responses')
      .field('questionnaire', testQId)
      .field('timestamp', new Date().getTime()) // Millis since epoch
      .field('lat', (Math.random() * 360) - 180)
      .field('lng', (Math.random() * 180) - 90)
      .field('locAcc', Math.floor(Math.random() * 100)) // 0 - 100 Integer test
      .field('data[key]', 'value')
      .field('data[foo]', 'bar')
      .field('data[biz]', 'baz')
      .attach('media1', __dirname + '/data/example1.jpg')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        done()
      })
  })

  it('POST /api/questionnaires/x/responses with multiple photos should save new response', function (done) {
    this.timeout(5000);
    rAgent
      .post('/api/questionnaires/' + testQId + '/responses')
      .field('questionnaire', testQId)
      .field('timestamp', new Date().getTime()) // Millis since epoch
      .field('lat', (Math.random() * 360) - 180)
      .field('lng', (Math.random() * 180) - 90)
      .field('locAcc', Math.floor(Math.random() * 100)) // 0 - 100 Integer test
      .field('data[key]', 'value')
      .field('data[foo]', 'bar')
      .field('data[biz]', 'baz')
      .attach('media1', __dirname + '/data/example1.jpg')
      .attach('media2', __dirname + '/data/example2.jpg')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        done()
      })
  })

  it('POST /api/questionnaires/x/responses with MP3 should save new response', function (done) {
    this.timeout(5000);
    rAgent
      .post('/api/questionnaires/' + testQId + '/responses')
      .field('questionnaire', testQId)
      .field('timestamp', new Date().getTime()) // Millis since epoch
      .field('lat', (Math.random() * 360) - 180)
      .field('lng', (Math.random() * 180) - 90)
      .field('locAcc', Math.floor(Math.random() * 100)) // 0 - 100 Integer test
      .field('data[key]', 'value')
      .field('data[foo]', 'bar')
      .field('data[biz]', 'baz')
      .attach('media1', __dirname + '/data/example1.mp3')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        done()
      })
  })

  it('GET /api/questionnaires/x/responses should show responses', function (done) {
    rAgent
      .get('/api/questionnaires/' + testQId + '/responses')
      .expect(200)
      .expect(/\bresult\b/, done())
  })

  after(function () {
    server.close()
  })
})
