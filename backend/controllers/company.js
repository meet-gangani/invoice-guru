const { sendError, sendSuccess } = require('./utils')
const { CompanyStore } = require('../models')
const fs = require('fs')
const path = require('path')

exports.createCompany = async (req, res) => {
  try {
    const {
      name,
      logo,
      username,
      password,
      status,
      owner,
      contactPerson,
      contactNumber,
      address,
      pinCode,
      stamp,
      sign
    } = req.body

    if (!name || !username || !password) {
      return sendError(res, 'Missing required fields', null, 400)
    }

    await CompanyStore.create({
      name,
      logo,
      username,
      password,
      status,
      owner,
      contactPerson,
      contactNumber,
      address,
      pinCode,
      stamp,
      sign
    })
    return sendSuccess(res)
  } catch (error) {
    return sendError(res, 'Error while adding company', error)
  }
}

exports.updateCompany = async (req, res) => {
  try {
    const id = req.params.id
    const {
      name,
      logo,
      username,
      password,
      status,
      owner,
      contactPerson,
      contactNumber,
      address,
      pinCode,
      stamp,
      sign
    } = req.body

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
          status,
          owner,
          contactPerson,
          contactNumber,
          address,
          pinCode,
          stamp,
          sign
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
    const companies = await CompanyStore.find({}).sort({ createdAt: -1 })

    return sendSuccess(res, { companies })
  } catch (error) {
    return sendError(res, 'Error while fetching company list', error)
  }
}

exports.getAccessibleCompanies = async (req, res) => {
  try {
    let filter = {}

    if (req.companyId) {
      filter = { _id: req.companyId }
    }

    const companies = await CompanyStore.find(filter).sort({ createdAt: -1 })

    return sendSuccess(res, { companies })
  } catch (error) {
    return sendError(res, 'Error while fetching company list', error)
  }
}

exports.uploadCompanyMedia = async (req, res) => {
  try {
    const id = req.params.id
    const field = req.params.field
    const allowedFields = ['stamp', 'sign']

    if (!allowedFields.includes(field)) {
      return sendError(res, 'Invalid upload field', null, 400)
    }

    const file = req?.files?.file
    if (!file) {
      return sendError(res, 'No file uploaded', null, 400)
    }

    const assetsRoot = path.join(process.cwd(), 'assets')
    const targetDir = path.join(assetsRoot, 'company', id)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    const extension = path.extname(file.name || '')
    const fileName = `${field}-${Date.now()}${extension}`
    const filePath = path.join(targetDir, fileName)

    await file.mv(filePath)

    const url = `/assets/company/${id}/${fileName}`
    return sendSuccess(res, { url })
  } catch (error) {
    return sendError(res, 'Error while uploading media', error)
  }
}

