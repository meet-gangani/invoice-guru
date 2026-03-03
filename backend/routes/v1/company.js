const router = require('express').Router()
const fileUpload = require('../../middleware/FileUpload')

const {
  getGame,
  getGameList,
  updateGame,
  deleteGames,
  uploadGameZip,
  uploadGameThumbnail
} = require('../../controllers/game')

const {
  createCompany,
  dashboardCards,
  getCompanies
} = require('../../controllers/company')

// User routes - /v1/company
router.get('/dashboard-cards', dashboardCards)

router.post('/create', createCompany)
router.get('/', getCompanies)

router.get('/:slug', getGame)
// router.get('/', getGameList)

router.put('/:id', updateGame)
router.delete('/:id', deleteGames)
router.post('/upload', uploadGameZip)
router.post('/upload-thumbnail', fileUpload, uploadGameThumbnail)

module.exports = router
