const express = require('express')
const middleware = require('../controllers/middleware')
const users = require('../controllers/users')()
const multipart = require('connect-multiparty')()

const router = express.Router()

router.get('/', middleware.ensureIsSuper, users.list)
router.get('/:id', middleware.ensureIsOwner, users.read)
router.post('/:id', middleware.ensureIsOwner, multipart, users.edit)
router.post('/:id/password', middleware.ensureIsOwner, multipart, users.editpassword)
router.delete('/:id', middleware.ensureIsOwner, middleware.ensureIsOwner, users.remove)

module.exports = router
