const { sendError } = require('../controllers/utils')
const fs = require('fs')

const categoryFileUpload = async (req, res, next) => {
  try {
    req.directoryPathToStore = `category/${req.body.id}/`
    if (!fs.existsSync(req.directoryPathToStore)) {
      fs.mkdirSync(req.directoryPathToStore)
    }

    next()
  } catch (error) {
    return sendError(res, 'Internal Server Error', error, 500)
  }
}

module.exports = categoryFileUpload
