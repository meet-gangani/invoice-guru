const router = require('express').Router()
const fileUpload = require('../../middleware/FileUpload')

const {
  createCompany,
  updateCompany,
  getCompanies
} = require('../../controllers/company')

// User routes - /v1/company
router.post('/create', createCompany)
router.put('/:id', updateCompany)
router.get('/', getCompanies)

module.exports = router
