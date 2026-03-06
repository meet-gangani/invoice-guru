const jwt = require('jsonwebtoken')
const constants = require('../global')
const { sendError } = require('../controllers/utils')
const { UserStore } = require('../models')

const authentication = async (req, res, next) => {
  try {
    const authorization = req.header('Authorization')
    if (!authorization) {
      return sendError(res, 'No token found', null, 401)
    }

    const decryptedToken = await jwt.verify(authorization, constants.security.TOKEN_SECRET)

    const currentTimestamp = Math.floor(Date.now() / 1000)
    if (decryptedToken.exp && currentTimestamp > decryptedToken.exp) {
      return sendError(res, 'Token has expired', null, 401)
    }

    const userId = decryptedToken._id

    if (!userId) {
      return sendError(res, 'UserId not found', null, 401)
    }

    const user = await UserStore.findById({
      _id: userId
    }).lean()

    if (!user) {
      return sendError(res, 'User not found', null, 401)
    }

    // TODO : recheck token logic
    // if (!user.tokens.includes(authorization)) {
    //   return sendError(res, 'User does not have valid token', null, 401)
    // }

    req.user = user

    next()
  } catch (error) {
    return sendError(res, 'Internal Server Error', error, 500)
  }
}

module.exports = authentication
