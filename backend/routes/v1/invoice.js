const router = require('express').Router()

const {
  dashboardCards,
  getInvoices,
  getInvoiceByTemplateApi,
  getInvoiceApi,
  saveInvoiceApi
} = require('../../controllers/invoice')

router.get('/dashboard-cards', dashboardCards)
router.get('/by-template/:template', getInvoiceByTemplateApi)
router.get('/:id', getInvoiceApi)
router.post('/save', saveInvoiceApi)
router.get('/', getInvoices)

module.exports = router
