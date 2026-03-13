const jwt = require('jsonwebtoken')
const constants = require('../global')
const { sendError } = require('../controllers/utils')
const { UserStore, CompanyStore } = require('../models')

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

    const typeId = decryptedToken._id
    const isAdmin = decryptedToken.isAdmin

    if (!typeId) {
      return sendError(res, 'UserId not found', null, 401)
    }

    if (isAdmin) {
      const user = await UserStore.findById({
        _id: typeId
      }).lean()

      if (!user) {
        return sendError(res, 'User not found', null, 401)
      }
    } else {
      const company = await CompanyStore.findOne({
        _id: typeId,
        status: "Active"
      }).lean()

      if (!company) {
        return sendError(res, 'company user not found', null, 401)
      }
    }

    req.typeId = typeId
    req.companyId = isAdmin ? null : typeId
    req.isAdmin = isAdmin

    next()
  } catch (error) {
    return sendError(res, 'Internal Server Error', error, 401)
  }
}

module.exports = authentication
