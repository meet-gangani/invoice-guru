const { sendError, sendSuccess } = require('./utils')
const { CustomerStore } = require('../models')

exports.createCustomer = async (req, res) => {
  try {
    const {
      name,
      address,
      mail,
      pinCode,
      shipTo,
      billTo,
      contact
    } = req.body

    if (!name || !mail) {
      return sendError(res, 'Missing required fields', null, 400)
    }

    await CustomerStore.create({
      name,
      address,
      mail,
      pinCode,
      shipTo,
      billTo,
      contact,
      company_id: req.companyId
    })
    return sendSuccess(res)
  } catch (error) {
    return sendError(res, 'Error while adding customer', error)
  }
}

exports.updateCustomer = async (req, res) => {
  try {
    const id = req.params.id
    const {
      name,
      address,
      mail,
      pinCode,
      shipTo,
      billTo,
      contact
    } = req.body

    if (!name || !mail) {
      return sendError(res, 'Missing required fields', null, 400)
    }

    const updatedCustomer = await CustomerStore.findByIdAndUpdate(
        id,
        {
          name,
          address,
          mail,
          pinCode,
          shipTo,
          billTo,
          contact,
          company_id: req.companyId
        },
        { new: true }
    )

    if (!updatedCustomer) {
      return sendError(res, 'Customer not found', null, 404)
    }

    return sendSuccess(res, 'Customer updated successfully')
  } catch (error) {
    return sendError(res, 'Error while updating customer', error)
  }
}

exports.getCustomers = async (req, res) => {
  try {
    let filter = {}

    if (req.companyId) {
      filter = { _id: req.companyId }
    }

    const customers = await CustomerStore.find(filter).sort({ createdAt: -1 })

    return sendSuccess(res, { customers })
  } catch (error) {
    return sendError(res, 'Error while fetching customer list', error)
  }
}
