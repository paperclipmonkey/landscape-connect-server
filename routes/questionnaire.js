const express = require('express')
const middleware = require('../controllers/middleware')
const questionnaires = require('../controllers/questionnaires')()

const router = express.Router()

router.get('/public', questionnaires.list_public)
router.get('/:id', questionnaires.read)
router.get('/:id/qr', questionnaires.qr)
router.get('/', middleware.ensureLoggedIn, questionnaires.list)
router.delete('/:id', middleware.ensureLoggedIn, middleware.ensureIsOwner, questionnaires.remove)
router.post('/:id', middleware.ensureLoggedIn, middleware.ensureIsOwner, questionnaires.update)
router.post('/', questionnaires.create)

module.exports = router
