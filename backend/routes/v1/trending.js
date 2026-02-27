const router = require('express').Router()

const { updateTrendingOrder } = require('../../controllers/trending')

// User routes - /v1/trending
router.put('/update-order', updateTrendingOrder)

module.exports = router
