const express = require('express')
const questionnaires = require('../controllers/questionnaires')()
const router = express.Router()

// Public redirects
router.get('/questionnaires/', function (req, res) { res.redirect('/app/#/page/questionnaires') })
router.get('/questionnaires/:id', function (req, res) {
    if (req.headers['user-agent'] && req.headers['user-agent'].indexOf('LandscapeConnect') !== -1) {
        return questionnaires.read(req, res)
    }
    // Check if the request is from the app and redirect
    return res.redirect('/app/#/page/questionnaires/' + req.params.id)
})

module.exports = router