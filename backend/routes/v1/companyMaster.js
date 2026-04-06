const router = require('express').Router()

const {
  createCompanyMaster,
  updateCompanyMaster,
  getCompaniesMaster,
  getAccessibleCompaniesMaster,
} = require('../../controllers/companyMaster')

// User routes - /v1/company-master
router.post('/create', createCompanyMaster)
router.put('/:id', updateCompanyMaster)
router.get('/accessible', getAccessibleCompaniesMaster)
router.get('/', getCompaniesMaster)

module.exports = router
