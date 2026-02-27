const { sendError } = require('../controllers/utils')
const fs = require('fs')
const fileUpload = async (req, res, next) => {
  try {
    req.directoryPathToStore = `games/${req.body.id}/`
    if (!fs.existsSync(req.directoryPathToStore)) {
      fs.mkdirSync(req.directoryPathToStore)
    }

    next()
  } catch (error) {
    return sendError(res, 'Internal Server Error', error, 500)
  }
}

module.exports = fileUpload
