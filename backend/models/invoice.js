const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const { Schema } = mongoose
const { defaultFields, defaultSchemaOptions } = require('./model-utils')

const InvoiceSchema = new Schema({
  _id: { type: Schema.Types.String, required: true, default: uuidv4 },
  company: { type: Schema.Types.String, required: false, ref: 'company' },
  customer: { type: Schema.Types.String, required: false, ref: 'customer' },
  date: { type: Date, required: true },
  performa: { type: Schema.Types.Mixed },
  performaApproved: { type: Schema.Types.Boolean, default: false },
  commercial: { type: Schema.Types.Mixed },
  commercialApproved: { type: Schema.Types.Boolean, default: false },
  packaging: { type: Schema.Types.Mixed },
  packagingApproved: { type: Schema.Types.Boolean, default: false },
  scomet: { type: Schema.Types.Mixed },
  scometApproved: { type: Schema.Types.Boolean, default: false },
  evd: { type: Schema.Types.Mixed },
  evdApproved: { type: Schema.Types.Boolean, default: false },
  letterHead: { type: Schema.Types.Mixed },
  letterHeadApproved: { type: Schema.Types.Boolean, default: false },
  performaHistory: [ { type: Schema.Types.Mixed } ],
  ...defaultFields
}, {
  ...defaultSchemaOptions
})

const Invoice = mongoose.model('invoice', InvoiceSchema, 'invoices')

module.exports = Invoice
