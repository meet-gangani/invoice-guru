const router = require('express').Router()

const {
  dashboardCards,
  getInvoices,
  getInvoiceByType,
  getInvoiceById,
  saveInvoice
} = require('../../controllers/invoice')

router.get('/dashboard-cards', dashboardCards)
router.get('/by-template/:template', getInvoiceByType)
router.get('/:id', getInvoiceById)
router.post('/save', saveInvoice)
router.get('/', getInvoices)

module.exports = router
