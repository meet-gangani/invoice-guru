const { TrendingStore, GameStore } = require('../models')
const { sendSuccess, sendError } = require('./utils')

const getAllTrendings = async (req, res) => {
  try{
    const trendings = await TrendingStore.find().sort({position: 1}).populate({
      path: 'gameId',
      select: 'title slug thumbnail gameName',
      model: 'game'
    });;


    return sendSuccess(res, { trendings })
  } catch(error) {
    return sendError(res, 'Error while fetching trending', error)
  }
}

const updateTrendingOrder = async (req, res) => {
  try{
    const { trendingId, gameId } = req.body

    if(!trendingId ||!gameId) {
      return sendError(res, 'Invalid request', null, 400)
    }

    const updateTrending = await TrendingStore.findByIdAndUpdate(trendingId, { gameId: gameId })

    if(!updateTrending) {
      return sendError(res, 'Trending not found', null, 404)
    }

    return sendSuccess(res, 'Trending updated successfully')
  } catch (error) {
    return sendError(res, 'Error while updating trending order', error)
  }
}

module.exports = {
  getAllTrendings,
  updateTrendingOrder
}
