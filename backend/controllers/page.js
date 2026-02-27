const { PageStore } = require('../models')
const { sendSuccess, sendError } = require('./utils')

const getPageDetails = async (req, res) => {
  try {
    const pageId = req.params.id
    const pageData = await PageStore.findOne({ _id: pageId })

    sendSuccess(res, pageData)
  } catch (error) {
    sendError(res, 'Error while fetching page info.', error)
  }
}

const updatePageDetails = async (req, res) => {
  try {
    const pageId = req.params.id
    const pageInfo = req.body

    const payload =
        pageId === 'ads-setup'
            ? { details: pageInfo?.description }
            : { description:  pageInfo?.description}

    if (!pageId) {
      return sendError(res, 'Invalid page id', null, 400)
    }
    const pageData = await PageStore.findOneAndUpdate({ _id: pageId }, payload, { upsert: true, returnOriginal: false })

    return sendSuccess(res, pageData)
  } catch (error) {
    return sendError(res, 'internal server error', error, 500)
  }
}

module.exports = {
  getPageDetails,
  updatePageDetails
}
