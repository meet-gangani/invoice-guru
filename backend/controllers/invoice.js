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

exports.getInvoiceApi = async (req, res) => {
  try {
    const invoice = await InvoiceStore.findById(req.params.id)
    if (!invoice) {
      return sendError(res, 'Invoice not found', new Error('Invoice not found'), 404)
    }

    return sendSuccess(res, invoice)
  } catch (error) {
    return sendError(res, 'Error while fetching invoice', error)
  }
}

exports.saveInvoiceApi = async (req, res) => {
  try {
    const { _id, date, data, template, type, ...rest } = req.body || {}
    const payloadData = data || rest
    const payloadType =
      type ||
      template ||
      payloadData?.type ||
      payloadData?.template ||
      'scomet'
    const parseDateInput = (value) => {
      if (!value) return new Date()
      if (value instanceof Date) return value
      if (typeof value === 'string') {
        const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/)
        if (match) {
          const [ , dd, mm, yyyy ] = match
          return new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`)
        }
      }
      return new Date(value)
    }
    const payloadDate = parseDateInput(date)

    let invoice = null
    if (_id) {
      invoice = await InvoiceStore.findById(_id)
      if (invoice) {
        invoice.date = payloadDate
        invoice.type = payloadType
        invoice.data = payloadData
        await invoice.save()
      } else {
        invoice = await InvoiceStore.create({
          _id,
          date: payloadDate,
          type: payloadType,
          data: payloadData
        })
      }
    } else {
      invoice = await InvoiceStore.findOne({ type: payloadType })
      if (invoice) {
        invoice.date = payloadDate
        invoice.type = payloadType
        invoice.data = payloadData
        await invoice.save()
      } else {
        invoice = await InvoiceStore.create({
          date: payloadDate,
          type: payloadType,
          data: payloadData
        })
      }
    }

    return sendSuccess(res, invoice, 200)
  } catch (error) {
    return sendError(res, 'Error while saving invoice', error)
  }
}

exports.getInvoiceByTemplateApi = async (req, res) => {
  try {
    const template = req.params.template
    if (!template) {
      return sendError(res, 'Type is required', new Error('Type is required'), 400)
    }
    const invoice = await InvoiceStore.findOne({ type: template })
    if (!invoice) {
      return sendSuccess(res, null, 200)
    }
    return sendSuccess(res, invoice, 200)
  } catch (error) {
    return sendError(res, 'Error while fetching invoice', error)
  }
}
