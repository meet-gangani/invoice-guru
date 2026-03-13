const router = require('express').Router()

const {
  createCustomer,
  updateCustomer,
  getCustomers
} = require('../../controllers/customer')

// Customer routes - /v1/customer
router.post('/create', createCustomer)
router.put('/:id', updateCustomer)
router.get('/', getCustomers)

module.exports = router
