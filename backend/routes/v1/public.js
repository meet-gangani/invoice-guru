const router = require('express').Router()

const { login, register, verifyUser } = require('../../controllers/user')

// Public
router.post('/login', login)
router.post('/register', register)
router.post('/verify-user', verifyUser)


module.exports = router
