const { sendSuccess, sendError } = require('./utils')
const { InvoiceStore, CompanyStore } = require('../models')

exports.dashboardCards = async (req, res) => {
  try {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)

    let filter = {}
    if (req.companyId) {
      filter = {
        company: req.companyId
      }
    }

    const [ totalInvoice, todayInvoice ] = await Promise.all([
      InvoiceStore.countDocuments(filter),
      InvoiceStore.countDocuments({
        ...filter,
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
    let filter = {}
    if (req.companyId) {
      filter = {
        company: req.companyId
      }
    }

    const invoices = await InvoiceStore.find(filter)
    .sort({ createdOn: -1 })
    .populate([
      {
        path: 'company',
        model: 'company',
        select: '_id name logo'
      },
      {
        path: 'customer',
        model: 'customer',
        select: '_id name'
      }
    ])
    .lean();

    return sendSuccess(res, { invoices })
  } catch (error) {
    return sendError(res, 'Error while fetching invoices', error)
  }
}

exports.getInvoiceById = async (req, res) => {
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

const TEMPLATE_FIELD_MAP = {
  performa: 'performa',
  commercial: 'commercial',
  packaging: 'packaging',
  scomet: 'scomet',
  evd: 'evd',
  letterHead: 'letterHead',
  delivery: 'commercial',
  packing: 'packaging',
  'letter-head': 'letterHead',
  letterhead: 'letterHead'
}

const normalizeTemplateKey = (value) => {
  if (!value) return null
  const key = String(value).trim()
  return TEMPLATE_FIELD_MAP[key] || null
}

const TEMPLATE_FIELDS = [ 'performa', 'commercial', 'packaging', 'scomet', 'evd', 'letterHead' ]
const APPROVAL_FIELD_MAP = {
  performa: 'performaApproved',
  commercial: 'commercialApproved',
  packaging: 'packagingApproved',
  scomet: 'scometApproved',
  evd: 'evdApproved',
  letterHead: 'letterHeadApproved'
}

exports.saveInvoice = async (req, res) => {
  try {
    const { _id, date, data, template, type, templateKey, ...rest } = req.body || {}
    const explicitField = TEMPLATE_FIELDS.find((field) => Object.prototype.hasOwnProperty.call(req.body || {}, field))
    const resolvedTemplateKey = normalizeTemplateKey(type || template || templateKey || explicitField) || 'scomet'
    const payloadData = data ?? (explicitField ? req.body[explicitField] : rest)
    const approvalField = APPROVAL_FIELD_MAP[resolvedTemplateKey]
    const hasApprovalFlag = approvalField && Object.prototype.hasOwnProperty.call(req.body || {}, approvalField)
    const approvalValue = hasApprovalFlag ? Boolean(req.body[approvalField]) : undefined

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
      if (!invoice) {
        return sendError(res, 'Invoice not found', new Error('Invoice not found'), 404)
      }
      invoice.date = payloadDate
      invoice[resolvedTemplateKey] = payloadData
      if (rest.company) invoice.company = rest.company
      if (rest.customer) invoice.customer = rest.customer
      if (hasApprovalFlag) invoice[approvalField] = approvalValue
      await invoice.save()
    } else {
      let payload = {
        date: payloadDate,
        [resolvedTemplateKey]: payloadData
      }

      if (req.companyId) {
        payload.company = req.companyId
      } else if (rest.company) {
        payload.company = rest.company
      }

      if (rest.customer) {
        payload.customer = rest.customer
      }

      if (hasApprovalFlag) {
        payload[approvalField] = approvalValue
      }

      invoice = await InvoiceStore.create(payload)
    }

    return sendSuccess(res, invoice, 200)
  } catch (error) {
    return sendError(res, 'Error while saving invoice', error)
  }
}

exports.getInvoiceByType = async (req, res) => {
  try {
    const template = req.params.template
    if (!template) {
      return sendError(res, 'Type is required', new Error('Type is required'), 400)
    }
    const templateKey = normalizeTemplateKey(template)
    if (!templateKey) {
      return sendError(res, 'Invalid type', new Error('Invalid type'), 400)
    }
    const invoice = await InvoiceStore.findOne({
      $or: [
        { [templateKey]: { $exists: true, $ne: null } },
        { type: template }
      ]
    })
    if (!invoice) {
      return sendSuccess(res, null, 200)
    }
    return sendSuccess(res, invoice, 200)
  } catch (error) {
    return sendError(res, 'Error while fetching invoice', error)
  }
}
