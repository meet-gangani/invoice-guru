const router = require('express').Router()

const {
  dashboardCards,
  getInvoices
} = require('../../controllers/invoice')

router.get('/dashboard-cards', dashboardCards)
router.get('/', getInvoices)


module.exports = router
