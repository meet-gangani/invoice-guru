const { sendSuccess, sendError } = require('./utils')
const { InvoiceStore, CompanyStore } = require('../models')

exports.dashboardCards = async (req, res) => {
  try {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)

    const [ totalInvoice, todayInvoice ] = await Promise.all([
      InvoiceStore.countDocuments(),
      InvoiceStore.countDocuments({
        date: {
          $gte: startOfToday,
          $lte: endOfToday
        }
      })
    ])

    return sendSuccess(res, {
      todayInvoice,
      totalInvoice
    })
  } catch (error) {
    return sendError(res, 'error while fetching dashboard data', error)
  }
}

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await InvoiceStore.find().sort({ createdAt: -1 })

    return sendSuccess(res, { invoices })
  } catch (error) {
    return sendError(res, 'Error while fetching invoices', error)
  }
}