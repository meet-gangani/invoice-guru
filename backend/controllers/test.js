const { GameStore, CategoryStore, WebsiteStore } = require('../models')
const { sendSuccess, sendError } = require('./utils')
const fs = require('fs')
const path = require('path')

const deletePreviousGameVersion = async (req, res) => {
  try {
    const newVersion = req.body.url
    const games = await GameStore.find()
    const filterPath = await games.filter(game => game.url).map(game => ({ url: game.url.replace('https://localhost:5050', '') }))

    if(fs.existsSync(targetDir)){
      fs.mkdirSync()
    }


    return sendSuccess(res, filterPath)
  } catch (error) {
    return sendError(res, 'internal server error', error, 404)
  }
}

module.exports = {
  deletePreviousGameVersion
}
