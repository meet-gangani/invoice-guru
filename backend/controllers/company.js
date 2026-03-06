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

exports.updateCompany = async (req, res) => {
  try {
    const id = req.params.id
    const { name, logo, username, password, status } = req.body

    if (!name || !username || !password) {
      return sendError(res, 'Missing required fields', null, 400)
    }

    const updatedCompany = await CompanyStore.findByIdAndUpdate(
        id,
        {
          name,
          logo,
          username,
          password,
          status
        },
        { new: true } // return updated document
    )

    if (!updatedCompany) {
      return sendError(res, 'Company not found', null, 404)
    }

    return sendSuccess(res, 'Company updated successfully')
  } catch (error) {
    return sendError(res, 'Error while updating company', error)
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

