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

  it('GET / should return 200', function (done) {
    rAgent
      .get('/')
      .expect(200, done)
  })

  it('GET /views should return 200', function (done) {
    rAgent
      .get('/views')
      .expect(200, done)
  })

  //  it('GET /views with geoquery should return 200',function(done){
  // rAgent
  // 	.get('/views')
  // 	.query({
  //         "withinarea": [
  //             [-104.05, 48.99],
  //             [-97.22,  48.98],
  //             [-96.58,  45.94],
  //             [-104.03, 45.94],
  //             [-104.05, 48.99]
  // 	    ]
  //     })
  // 	.expect(200,done)
  //  })

  it('GET /views with bad geoquery should return 400', function (done) {
    rAgent
      .get('/views')
      .query({
        'withinarea': [
          // [-104.05, 48.99],//Not self closing - broken geometry
          [-97.22, 48.98],
          [-96.58, 45.94],
          [-104.03, 45.94],
          [-104.05, 48.99]
        ]
      })
      .expect(400, done)
  })

  after(function () {
    server.close()
  })

})
