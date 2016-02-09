var app = require('../app')
var request = require('supertest')
var eventServer = require('../eventemitter')
var server

describe('App API', function () {
  var rAgent, base64data, nonce, viewId, photoId
  before(function (done) {
    server = app.listen(process.env.PORT, function () {
      rAgent = request.agent(app)
      var fs = require('fs')
      var uuid = require('node-uuid')
      fs.readFile(__dirname + '/data/example.jpg', function (err, data) {
        if (err) {
          throw err
        }
        base64data = new Buffer(data).toString('base64')

        // TODO Make nonce unique each time
        nonce = uuid.v4()
        done()
      })
    })
  })

  function generateLatLng () {
    return {
      lat: 52.480977 + Math.random(),
      lng: -1.895142 + Math.random()
    }
  }

  function generateRating () {
    return Math.floor(Math.random() * 6)
  }

  function generateKnow () {
    var arr = ['Very well', 'Not very well', 'Not at all']
    return arr[Math.floor(Math.random() * 3)]
  }

  function generateAge () {
    var arr = ['0-18', '19-24', '25-44', '45-64', '65+']
    return arr[Math.floor(Math.random() * 5)]
  }

  function generateHeading () {
    return Math.random() * 360
  }

  it('POST /view should return 400', function (done) {
    rAgent
      .post('/view')
      .expect(400, done)
  })

  it('POST /view without age should return 400', function (done) {
    this.timeout(10000)
    rAgent
      .post('/view')
      .send({
        knowarea: generateKnow(),
        heading: generateHeading(),
        photo: base64data,
        rating: generateRating(),
        words: 'ca, ba, aa',
        comments: 'cat',
        lng: generateLatLng().lng,
        lat: generateLatLng().lat
      })
      .expect(400, done)
  })

  it('POST /view without knowarea should return 400', function (done) {
    this.timeout(10000)
    rAgent
      .post('/view')
      .send({
        age: generateAge(),
        heading: generateHeading(),
        photo: base64data,
        rating: generateRating(),
        words: 'ca, ba, aa',
        comments: 'cat',
        lng: generateLatLng().lng,
        lat: generateLatLng().lat
      })
      .expect(400, done)
  })

  it('POST /view without heading should return 200', function (done) {
    this.timeout(10000)
    rAgent
      .post('/view')
      .send({
        age: generateAge(),
        knowarea: generateKnow(),
        photo: base64data,
        rating: generateRating(),
        words: 'ca, ba, aa',
        comments: 'cat',
        lng: generateLatLng().lng,
        lat: generateLatLng().lat
      })
      .expect(200, done)
  })

  it('POST /view with wrong know should return 200', function (done) {
    this.timeout(10000)
    rAgent
      .post('/view')
      .send({
        age: generateAge(),
        know: 'Very well',
        photo: base64data,
        rating: generateRating(),
        words: 'ca, ba, aa',
        comments: 'cat',
        lng: generateLatLng().lng,
        lat: generateLatLng().lat
      })
      .expect(200, done)
  })

  it('POST /view without photo should return 400', function (done) {
    this.timeout(10000)
    rAgent
      .post('/view')
      .send({
        age: generateAge(),
        knowarea: generateKnow(),
        heading: generateHeading(),
        rating: generateRating(),
        words: 'ca, ba, aa',
        comments: 'cat',
        lng: generateLatLng().lng,
        lat: generateLatLng().lat
      })
      .expect(400, done)
  })

  it('POST /view without rating should return 400', function (done) {
    this.timeout(10000)
    rAgent
      .post('/view')
      .send({
        age: generateAge(),
        knowarea: generateKnow(),
        heading: generateHeading(),
        photo: base64data,
        words: 'ca, ba, aa',
        comments: 'cat',
        lng: generateLatLng().lng,
        lat: generateLatLng().lat
      })
      .expect(400, done)
  })

  it('POST /view without words should return 400', function (done) {
    this.timeout(10000)
    rAgent
      .post('/view')
      .send({
        age: generateAge(),
        knowarea: generateKnow(),
        heading: generateHeading(),
        photo: base64data,
        rating: generateRating(),
        comments: 'cat',
        lng: generateLatLng().lng,
        lat: generateLatLng().lat
      })
      .expect(400, done)
  })

  // TODO - Should we throw an error with only 1 word?
  // it('POST /view with 1 word should return 400', function (done) {
  //   this.timeout(10000)
  //   rAgent
  //     .post('/view')
  //     .send({
  //       age: generateAge(),
  //       knowarea: generateKnow(),
  //       heading: generateHeading(),
  //       photo: base64data,
  //       rating: generateRating(),
  //       comments: 'cat',
  //       words: 'ca',
  //       lng: generateLatLng().lng,
  //       lat: generateLatLng().lat
  //     })
  //     .expect(400, done)
  // })

  it('POST /view without comments should return 200', function (done) {
    this.timeout(10000)
    rAgent
      .post('/view')
      .send({
        age: generateAge(),
        knowarea: generateKnow(),
        heading: generateHeading(),
        photo: base64data,
        rating: generateRating(),
        words: 'ca, ba, aa',
        lng: generateLatLng().lng,
        lat: generateLatLng().lat
      })
      .expect(200, done)
  })

  it('POST /view without lng should return 400', function (done) {
    this.timeout(10000)
    rAgent
      .post('/view')
      .send({
        age: generateAge(),
        knowarea: generateKnow(),
        heading: generateHeading(),
        photo: base64data,
        rating: generateRating(),
        comments: 'cat',
        lat: generateLatLng().lat
      })
      .expect(400, done)
  })

  it('POST /view without lat should return 400', function (done) {
    this.timeout(10000)
    rAgent
      .post('/view')
      .send({
        age: generateAge(),
        knowarea: generateKnow(),
        heading: generateHeading(),
        photo: base64data,
        rating: generateRating(),
        comments: 'cat',
        lat: generateLatLng().lat
      })
      .expect(400, done)
  })

  it('POST /view should return 200', function (done) {
    this.timeout(10000)
    rAgent
      .post('/view')
      .send({
        age: generateAge(),
        knowarea: generateKnow(),
        heading: generateHeading(),
        photo: base64data,
        rating: generateRating(),
        words: 'ca, ba, aa',
        comments: 'cat',
        lng: generateLatLng().lng,
        lat: generateLatLng().lat
      })
      .expect(200, done)
  })

  it('POST /view should send email', function (done) {
    this.timeout(10000)
    eventServer.once('email:sent', done)
    rAgent
      .post('/view')
      .send({
        age: generateAge(),
        knowarea: generateKnow(),
        heading: generateHeading(),
        photo: base64data,
        rating: generateRating(),
        words: 'ca, ba, aa',
        comments: 'cat',
        lng: generateLatLng().lng,
        lat: generateLatLng().lat
      })
  })

  it('POST /view with nonce should return 200', function (done) {
    rAgent
      .post('/view')
      .send({
        age: generateAge(),
        knowarea: generateKnow(),
        heading: generateHeading(),
        photo: base64data,
        nonce: nonce,
        rating: generateRating(),
        words: 'ca, ba, aa',
        comments: 'cat',
        lng: generateLatLng().lng,
        lat: generateLatLng().lat
      }).expect(200).end(function (err, res) {
      viewId = res.body.id
      photoId = res.body.photo
      done(err)
    })
  })

  it('POST /view with file should return 200', function (done) {
    this.timeout(5000)
    rAgent
      .post('/view')
      .attach('image', __dirname + '/data/example.jpg', 'photo.jpg')
      .field('age', generateAge())
      .field('knowarea', generateKnow())
      .field('heading', generateHeading())
      .field('rating', generateRating())
      .field('words', 'ca, ba, aa')
      .field('comments', 'cat')
      .field('lng', generateLatLng().lng)
      .field('lat', generateLatLng().lat)
      .expect(200, done)
  })

  it('POST /view with nonce should return same ID', function (done) {
    rAgent
      .post('/view')
      .send({
        age: generateAge(),
        knowarea: generateKnow(),
        heading: generateHeading(),
        photo: base64data,
        nonce: nonce,
        rating: generateRating(),
        words: 'ca, ba, aa',
        comments: 'cat',
        lng: generateLatLng().lng,
        lat: generateLatLng().lat
      })
      .expect(function (res) {
        return res.body.id !== viewId // Works in reverse. True means error, false means pass
      }).end(done)
  })

  it('GET /admin/view/:id/map should return image file', function (done) {
    this.timeout(5000)
    rAgent
      .get('/admin/views/' + viewId + '/map')
      .expect(200, done)
  })

  it('GET /img/:photo/100 should redirect to image', function (done) {
    this.timeout(5000)
    rAgent
      .get('/img/' + photoId + '/100')
      .expect(302, done)
  })

  it('GET /img/:photobad/100 should return error', function (done) {
    this.timeout(5000)
    rAgent
      .get('/img/' + photoId + 1 + '/100')
      .expect(400, done)
  })

  it("GET /view/invalid shouldn't show view", function (done) {
    rAgent
      .get('/view/invalid')
      .expect(400, done)
  })

  after(function () {
    server.close()
  })
})
