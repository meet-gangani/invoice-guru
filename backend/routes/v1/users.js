const router = require('express').Router()

const {
 changePassword
} = require('../../controllers/user')

router.put('/change-password', changePassword)

module.exports = router
