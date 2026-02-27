const dotenv = require('dotenv')
dotenv.config()
const constants = require('./global/index')
const cors = require('cors')
const express = require('express')
const app = express()
const morganBody = require('morgan-body')
const fs = require('fs')
const path = require('path')
const { publicRoutes, privateRoutes } = require('./routes')
const mongodb = require('./mongodb-config')
const authentication = require('./middleware/Authentication')
const fileUpload = require('express-fileupload')
const requestMonitor = require('express-status-monitor')
const requestMonitorConfig = require('./requestMonitorConfig.json')

const initialize = async () => {
  await mongodb.getOrInitializeDatabase()

  app.use(express.json())
  app.use(cors())

  const allowedOrigins = [
    'http://localhost:4000',
    'http://localhost:4001',
    'https://emoongames.com',
    'https://admin.emoongames.com'
  ]

  const containsPublicDir = (fullUrl, publicDir) => {
    return publicDir.some(word => fullUrl.includes(word))
  }

  // app.use((req, res, next) => {
  //   cors({
  //     origin: function(origin, callback) {
  //       const publicDir = [ 'zip', 'games', 'category', 'blogs' ]
  //       if ('no-token' in req.headers) return callback(null, true)
  //       if (containsPublicDir(req.originalUrl, publicDir)) return callback(null, true)
  //       if (!origin) return callback(new Error('Missing Permission Token'), false)
  //       if (allowedOrigins.includes(origin)) return callback(null, true)
  //
  //       return callback(new Error(`Access Blocked`), false)
  //     },
  //     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //     credentials: true
  //   })(req, res, next)
  // })

  app.use(fileUpload())
  app.use(requestMonitor(requestMonitorConfig))

//   app.use((req, res, next) => {
//     res.set('X-Robots-Tag', 'noindex, nofollow')
//     next()
//   })

//   app.get('/robots.txt', (req, res) => {
//     res.type('text/plain')
//     res.send(`User-agent: *
// Disallow: /`)
//   })

  morganBody(app, {
    prettify: false,
    includeNewLine: true
  })

  const uploadDir = 'zip/'
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir)
  }

  const thumbnailDir = 'games/'
  if (!fs.existsSync(thumbnailDir)) {
    fs.mkdirSync(thumbnailDir)
  }

  const categoryDir = 'category/'
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir)
  }

  const blogDir = 'blogs/'
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir)
  }

  const dirname = path.resolve()
  app.use('/games', express.static(path.join(dirname, 'games')))
  app.use('/blogs', express.static(path.join(dirname, 'blogs')))
  app.use('/category', express.static(path.join(dirname, 'category')))

  // Public Routes! i.e. Login, SignUp etc.
  app.use('/', publicRoutes)

  // app.use(authentication)

  // Private Routes! i.e. System routes etc.
  app.use('/', privateRoutes)

  app.use('*', (_req, res) => res.send('Oops! We couldn\'t find what you\'re looking for. Please check your request and try again.'))

  app.use((error, req, res, next) => {
    return res.status(500).json({ error: error.message || 'Something unexpected happened!' })
  })

  app.listen(constants.PORT, () => console.log(`Listening on port http://localhost:${constants.PORT}`))
}

initialize().catch((error) => console.error('Error while setup server', error.message))
