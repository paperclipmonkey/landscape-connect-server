const express = require('express')
const middleware = require('../controllers/middleware')
const dashboard = require('../controllers/dashboard')()

const router = express.Router()
router.use(middleware.ensureLoggedIn) // Add auth middleware to all admin paths

router.get('/questionnaires/total', dashboard.questionnaires_total)
router.get('/responses/total', dashboard.responses_total)
router.get('/responses/latest', dashboard.responses_latest)
router.get('/events', dashboard.events)

module.exports = router
