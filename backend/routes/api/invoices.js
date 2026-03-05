const router = require('express').Router()

const { getInvoiceApi, saveInvoiceApi, getInvoiceByTemplateApi } = require('../../controllers/invoice')

router.get('/by-template/:template', getInvoiceByTemplateApi)
router.get('/:id', getInvoiceApi)
router.post('/save', saveInvoiceApi)

module.exports = router
