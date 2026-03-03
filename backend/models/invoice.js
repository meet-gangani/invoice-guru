const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const { Schema } = mongoose
const { defaultFields, defaultSchemaOptions } = require('./model-utils')

const InvoiceSchema = new Schema({
  _id: { type: Schema.Types.String, required: true, default: uuidv4 },
  date: { type: Date, required: true },
  data: { type: Schema.Types.Mixed },
  ...defaultFields
}, {
  ...defaultSchemaOptions
})

const Invoice = mongoose.model('invoice', InvoiceSchema, 'invoices')

module.exports = Invoice
