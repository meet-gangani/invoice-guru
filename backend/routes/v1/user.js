const router = require('express').Router()

const { getUsers, addUser, changePassword } = require('../../controllers/user')

// User routes - /v1/users
router.get('/', getUsers)
router.post('/', addUser)
router.put('/change-password', changePassword)
// router.put('/:userId', updateUser)
// router.delete('/:userId', deleteUser)

module.exports = router
