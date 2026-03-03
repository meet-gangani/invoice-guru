const router = require('express').Router()
const fileUpload = require('../../middleware/FileUpload')

const {
  createCompany,
  getCompanies
} = require('../../controllers/company')

// User routes - /v1/company
router.post('/create', createCompany)
router.get('/', getCompanies)

module.exports = router
