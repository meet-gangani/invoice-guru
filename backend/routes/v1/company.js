const router = require('express').Router()
const fileUpload = require('../../middleware/FileUpload')

const {
  createCompany,
  updateCompany,
  getCompanies,
  uploadCompanyMedia
} = require('../../controllers/company')

// User routes - /v1/company
router.post('/create', createCompany)
router.put('/:id', updateCompany)
router.get('/', getCompanies)
router.post('/:id/upload/:field', uploadCompanyMedia)

module.exports = router
