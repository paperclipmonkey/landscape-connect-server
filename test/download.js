var app = require('../app')
var request = require('supertest')
var server

describe('Downloads', function () {
  var mongoose = require('mongoose')
  var FeedbackModel = mongoose.model('response')

  var rAgent
  var viewId
  before(function (done) {
    this.timeout(10000)
    server = app.listen(process.env.PORT, function () {
      rAgent = request.agent(app)
      // Login using the rAgent
      rAgent
        .post('/view')
        .attach('image', __dirname + '/data/example.jpg', 'photo.jpg')
        .field('age', '0-18')
        .field('knowarea', 'Very well')
        .field('heading', '121.3')
        .field('rating', '4')
        .field('words', 'ca, ba, aa')
        .field('comments', 'cat')
        .field('lng', '11')
        .field('lat', '11')
        .end(function (err, res) {
          if (err) return done(err)
          viewId = JSON.parse(res.res.text).id
          if (!viewId) return done(new Error('Failed to create sample upload for download'))
          rAgent
            .post('/admin/login')
            .send({username: 'glastohacks@gmail.com', password: 'glastonbury'})
            .expect(302)
            .end(done)
        })
    })
  })

  // http://localhost:3010/admin/views/download/images/[%225351a143a4288dea3100001c%22,%225351a12da4288dea3100001b%22,%2253387d9aa4288dea3100000b%22,%22527faa8d606d4f890300000b%22,%22527fa6ab606d4f8903000009%22,%22524ecfa9f682daf036000001%22]
  it('GET /admin/views/x/download/kmz should return kmz file', function (done) {
    this.timeout(30000)
    rAgent
      .get('/admin/views/' + viewId + '/download/kmz/')
      // .expect('')//Check it has a filename
      .expect(200, done)
  })

  it('GET /admin/views/download/kmz/[ids] should return kmz file', function (done) {
    this.timeout(30000)
    rAgent
      .post('/admin/views/download/kmz/')
      .send({'ids': JSON.stringify([viewId])})
      // .expect('')//Check it has a filename
      .expect(200, done)
  })

  // ####Check responses download csv
  it('POST /admin/views/download/csv/[] should return csv spreadsheet', function (done) {
    this.timeout(30000)
    rAgent
      .post('/admin/views/download/csv/')
      .send({'ids': JSON.stringify([viewId])})
      // .expect('')//Check it has a filename
      .expect(/\bcat\b/)
      .expect(200, done)
  })

  it('GET /admin/views/x/download/image should return image', function (done) {
    this.timeout(30000)
    rAgent
      .get('/admin/views/' + viewId + '/download/image')
      // .expect('')//Check it has a filename
      // TODO - check filesize
      .expect(200, done)
  })

  it('GET /admin/views/download/images/[] should return images', function (done) {
    this.timeout(30000)
    rAgent
      .post('/admin/views/download/images/')
      .send({'ids': JSON.stringify([viewId])})
      // .expect('')//Check it has a filename
      .expect(200, done)
  })

  after(function (done) {
    // Delete view
    FeedbackModel.remove({_id: viewId}, function (err, result) {
      server.close()
      done(err)
    })
  })
})
