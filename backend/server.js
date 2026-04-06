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

  app.use(express.json({ limit: '50mb' }))

  app.use(cors())

  app.use(fileUpload())
  app.use(requestMonitor(requestMonitorConfig))

  morganBody(app, {
    prettify: false,
    includeNewLine: true
  })

  const assets = 'assets/'
  if (!fs.existsSync(assets)) {
    fs.mkdirSync(assets)
  }

  const dirname = path.resolve()
  app.use('/assets', express.static(path.join(dirname, 'assets')))

  // Public Routes! i.e. Login, SignUp etc.
  app.use('/', publicRoutes)

  app.use(authentication)

  // Private Routes! i.e. System routes etc.
  app.use('/', privateRoutes)

  app.use('*', (_req, res) => res.send('Oops! We couldn\'t find what you\'re looking for. Please check your request and try again.'))

  app.use((error, req, res, next) => {
    return res.status(500).json({ error: error.message || 'Something unexpected happened!' })
  })

  app.listen(constants.PORT, () => console.log(`Listening on port http://localhost:${constants.PORT}`))
}

initialize().catch((error) => console.error('Error while setup server', error.message))
