const router = require('express').Router()

const { updatePageDetails } = require('../../controllers/page')

// User routes - /v1/pages
router.put('/:id', updatePageDetails)

module.exports = router
