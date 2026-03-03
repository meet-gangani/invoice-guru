const { sendError, sendSuccess } = require('./utils')
const { CompanyStore } = require('../models')

exports.createCompany = async (req, res) => {
  try {
    const {
      name,
      logo,
      username,
      password,
      status
    } = req.body

    if (!name || !username || !password) {
      return sendError(res, 'Missing required fields', null, 400)
    }

    await CompanyStore.create({
      name,
      logo,
      username,
      password,
      status
    })
    return sendSuccess(res)
  } catch (error) {
    return sendError(res, 'Error while adding company', error)
  }
}

exports.getCompanies = async (req, res) => {
  try {
    const companies = await CompanyStore.find().sort({ createdAt: -1 })

    return sendSuccess(res, { companies })
  } catch (error) {
    return sendError(res, 'Error while fetching company list', error)
  }
}

exports.dashboardCards = async (req, res) => {
  try {

    return sendSuccess(res, {
      todayInvoice: 5,
      totalInvoice: 10
    })
  } catch (error) {
    return sendError(res, 'error while fetch count', error)
  }
}