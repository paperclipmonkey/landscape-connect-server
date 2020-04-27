const app = require('../app')
const request = require('supertest')
let server

describe('Questionnaires', function () {
  let rAgent
  let questionnaire
  before(function (done) {
    server = app.listen(process.env.PORT, function () {
      rAgent = request.agent(app)
      const mongoose = require('mongoose')
      const Questionnaire = mongoose.model('questionnaire')
      Questionnaire.findOne({'title': 'Test'}, function (err, obj) {
        questionnaire = obj
        done()
      })
    })
  })

  after(function () {
    server.close()
  })

  /* - - - - Questionnaires - - - - - */

  it('GET /api/questionnaires as normal client should show questionnaires', function (done) {
    rAgent
      .get('/api/questionnaires/public/')
      .expect(200)
      .expect(/\bresult\b/, done)
  })

  // it("GET /api/questionnaires/ as non-super shouldn't show private questionnaires", function (done) {
  //   rAgent
  //     .get('/api/questionnaires/')
  //     .expect(400, done)
  // })

  // it("POST /api/questionnaires/new/ as non-super shouldn't add new questionnaire", function (done) {
  //   rAgent
  //     .post('/api/questionnaires/new/')
  //     .send({
  //       name: 'test',
  //       twitter: 'test',
  //       website: 'test',
  //       loc: '{"coordinates":[[[-4.053811277785324,51.20433457239784],[-4.007597736803445,51.19739941184122],[-3.983156106324372,51.19157260178689],[-3.969179631372659,51.16337330788794],[-3.934741037118132,51.16149973059944],[-3.901256508974158,51.14712397920866],[-3.883183334265228,51.12839023268349],[-3.868934334228307,51.09561861180481],[-3.829000033563197,51.08293431937978],[-3.805015535777541,51.05843527715723],[-3.757645708638051,51.04900406172283],[-3.708601490362808,51.0444745274642],[-3.66713529859512,51.04098433395254],[-3.630689023451794,51.03693248293776],[-3.587082528726521,51.03612120055641],[-3.559864106907772,51.02700515443644],[-3.527487747005998,51.01527725063428],[-3.47000542459968,51.02574398190755],[-3.425718948107913,51.05105427475365],[-3.419051184211735,51.08202064205543],[-3.369616245361678,51.09024332844456],[-3.309589560900005,51.09401567519809],[-3.284057383075013,51.10846840712964],[-3.304903309058935,51.1375969737466],[-3.355666389188158,51.15895541899641],[-3.389709955239067,51.15698295550389],[-3.407657415592152,51.18021629602056],[-3.417455071614844,51.20210071739069],[-3.462733517018304,51.22222291870003],[-3.524540997136634,51.23875785292998],[-3.602202573010662,51.23769907111762],[-3.70703936116741,51.2410310602363],[-3.792458922712144,51.25635521190181],[-3.885188309357289,51.23992618335758],[-3.968217191674391,51.23805773517002],[-4.044344921288225,51.22127197537402],[-4.053811277785324,51.20433457239784]]],"type":"Polygon"}'
  //     })
  //     .expect(400, done)
  // })

  // - - - - - - - - - - - - - - 
  // Page redirects for normal clients and Android client app
  // - - - - - - - - - - - - - -

  it('GET /questionnaires/ as normal client should redirect to questionnaires page', function (done) {
    rAgent
      .get('/questionnaires/')
      .expect(302)
      .expect(/(app)/, done)
  })

  it('GET /questionnaires/x as normal client should redirect to questionnaire page', function (done) {
    rAgent
      .get(`/questionnaires/${questionnaire.serverId}`)
      .expect(302)
      .expect(/(app)/, done)
  })

  it('GET /api/questionnaires/x/qr should show qr code', function (done) {
    rAgent
      .get(`/api/questionnaires/${questionnaire.serverId}/qr`)
      .expect(200, done)
  })

  it('GET /questionnaires/x as Android client V1 should show JSON', function (done) {
    rAgent
      .get(`/questionnaires/${questionnaire.serverId}`)
      .set('User-Agent', 'LandscapeConnectV1')
      .expect(/(Test)/)
      .expect(200, done)
  })

  it('GET /questionnaires/x as Android client V2 should show JSON', function (done) {
    rAgent
      .get(`/questionnaires/${questionnaire.serverId}`)
      .set('User-Agent', 'LandscapeConnectV2')
      .expect(200)
      .expect(/(Test)/)
      .end(function (err, res) {
        if (err) return done(err)
        done()
      })
  })
})
