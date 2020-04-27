const express = require('express')
const middleware = require('../controllers/middleware')
const download = require('../controllers/download')()

const router = express.Router()

router.get('/questionnaires/:id/download/csv', middleware.ensurePublicOrAuthenticated, download.download_csv)
router.get('/questionnaires/:id/download/kmz', middleware.ensurePublicOrAuthenticated, download.download_kmz)
router.get('/questionnaires/:id/download/media', middleware.ensurePublicOrAuthenticated, download.download_media)

module.exports = router
