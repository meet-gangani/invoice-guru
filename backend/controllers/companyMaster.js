const { sendError, sendSuccess } = require('./utils')
const { CompanyMasterStore } = require('../models')

exports.createCompanyMaster = async (req, res) => {
  try {
    const {
      name,
      logo,
      username,
      status,
      owner,
      contactPerson,
      contactNumber,
      address,
      pinCode,
      stamp,
      sign
    } = req.body

    if (!name || !username) {
      return sendError(res, 'Missing required fields', null, 400)
    }

    await CompanyMasterStore.create({
      name,
      logo,
      username,
      status,
      owner,
      contactPerson,
      contactNumber,
      address,
      pinCode,
      stamp,
      sign,
      company_id: req.companyId
    })
    return sendSuccess(res)
  } catch (error) {
    return sendError(res, 'Error while adding company', error)
  }
}

exports.updateCompanyMaster = async (req, res) => {
  try {
    const id = req.params.id
    const {
      name,
      logo,
      username,
      status,
      owner,
      contactPerson,
      contactNumber,
      address,
      pinCode,
      stamp,
      sign
    } = req.body

    if (!name || !username) {
      return sendError(res, 'Missing required fields', null, 400)
    }

    const updatedCompany = await CompanyMasterStore.findByIdAndUpdate(
        id,
        {
          name,
          logo,
          username,
          status,
          owner,
          contactPerson,
          contactNumber,
          address,
          pinCode,
          stamp,
          sign,
          company_id: req.companyId
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

exports.getCompaniesMaster = async (req, res) => {
  try {
    const companies = await CompanyMasterStore.find({}).sort({ createdAt: -1 })

    return sendSuccess(res, { companies })
  } catch (error) {
    return sendError(res, 'Error while fetching company list', error)
  }
}

exports.getAccessibleCompaniesMaster = async (req, res) => {
  try {
    let filter = {}

    if (req.companyId) {
      filter = { company_id: req.companyId }
    }

    const companies = await CompanyMasterStore.find(filter).sort({ createdAt: -1 })

    return sendSuccess(res, { companies })
  } catch (error) {
    return sendError(res, 'Error while fetching company list', error)
  }
}