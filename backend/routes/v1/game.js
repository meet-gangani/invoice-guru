const router = require('express').Router()
const fileUpload = require('../../middleware/FileUpload')

const {
  createGame,
  getGame,
  getGameList,
  dashboardCards,
  updateGame,
  deleteGames,
  uploadGameZip,
  uploadGameThumbnail
} = require('../../controllers/game')

// User routes - /v1/games
router.get('/dashboard-cards', dashboardCards)
router.get('/:slug', getGame)
router.get('/', getGameList)
router.post('/create', createGame)
router.put('/:id', updateGame)
router.delete('/:id', deleteGames)
router.post('/upload', uploadGameZip)
router.post('/upload-thumbnail', fileUpload, uploadGameThumbnail)

module.exports = router
