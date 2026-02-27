const { FeatureStore } = require('../models')
const { sendSuccess, sendError } = require('./utils')

const getAllFeatures = async (req, res) => {
  try{
    const features = await FeatureStore.find().sort({position: 1}).populate({
      path: 'gameId',
      select: 'title slug thumbnail gameName',
      model: 'game'
    });
    return sendSuccess(res, { features })
  } catch(error) {
    return sendError(res, 'Error while fetching featured games', error)
  }
}

const updateFeatureOrder = async (req, res) => {
  try{
    const { featureId, gameId } = req.body

    if(!featureId ||!gameId) {
      return sendError(res, 'Invalid request', null, 400)
    }

    const updateFeature = await FeatureStore.findByIdAndUpdate(featureId, { gameId: gameId })

    if(!updateFeature) {
      return sendError(res, 'Feature not found', null, 404)
    }

    return sendSuccess(res, 'Feature updated successfully')
  } catch (error) {
    return sendError(res, 'Error while updating feature order', error)
  }
}

module.exports = {
  getAllFeatures,
  updateFeatureOrder
}
