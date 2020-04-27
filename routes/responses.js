const express = require('express')
const middleware = require('../controllers/middleware')
const responses = require('../controllers/responses')()
const multipart = require('connect-multiparty')()

const router = express.Router()

router.get('/:id/responses', responses.list)
router.get('/:id/statistics', middleware.ensurePublicOrAuthenticated, responses.statistics)
router.get('/:qid/responses/:id', middleware.ensurePublicOrAuthenticated, responses.read)
router.delete('/:qid/responses/:id', middleware.ensureIsOwner, responses.remove)
router.post('/:id/responses', multipart, middleware.saveUploaded, responses.create)

module.exports = router
