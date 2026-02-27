const router = require('express').Router()

const { updateFeatureOrder } = require('../../controllers/feature')

// User routes - /v1/feature

router.put('/update-order', updateFeatureOrder)

module.exports = router
