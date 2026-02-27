const router = require('express').Router()

const { login, register, verifyUser } = require('../../controllers/user')
const { getGame, getGameList, getAllGameList} = require('../../controllers/game')
const { deletePreviousGameVersion } = require('../../controllers/test')
const { getPageDetails } = require('../../controllers/page')
const { getAllTrendings } = require('../../controllers/trending')
const { getAllFeatures } = require('../../controllers/feature')
const { getBlogList, getBlog } = require('../../controllers/blog')

// User routes - /v1/users
router.post('/login', login)
router.post('/register', register)
router.post('/verify-user', verifyUser)

// User routes - /v1/game
router.get('/game/:slug', getGame)
router.get('/game', getGameList)
router.get('/all-games', getAllGameList)

router.get('/blog', getBlogList)
router.get('/blog/:slug', getBlog)

// User Routes - /v1/test
router.get('/hello', deletePreviousGameVersion)

// pages routes - /v1
router.get('/page/:id', getPageDetails)

// trending routes - /v1
router.get('/trending-list', getAllTrendings)

// feature routes - /v1
router.get('/feature-list', getAllFeatures)

module.exports = router
