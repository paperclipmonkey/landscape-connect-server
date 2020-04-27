const express = require('express')
const middleware = require('../controllers/middleware')
const users = require('../controllers/users')()
const authenticate = require('../controllers/authenticate')()
var pass = require('../authenticate')

const router = express.Router()

/**
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @param {Function} next 
 */
function loginFunction(req, res, next) {
    pass.authenticate(
        'local',
        function (err, user, info) {
            if (err) return res.sendStatus(401)
            if (!user) return res.sendStatus(401)
            req.logIn(user, function (err) {
                if (err) { return next(err); }
                req.app.emit('user.login')
                res.sendStatus(200) // Authentication successful. Redirect home.
            })
        }
    )(req, res, next)
}

// User login
router.get('/details/', middleware.ensureLoggedIn, users.me)
router.get('/menu/', middleware.ensureLoggedIn, users.menu)
router.post('/logout', middleware.ensureLoggedIn, authenticate.logout)
router.post('/register', users.register, loginFunction)
router.post('/login', loginFunction)

module.exports = router
