const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const { Schema } = mongoose
const { defaultFields, defaultSchemaOptions } = require('./model-utils')

const CustomerSchema = new Schema({
  _id: { type: Schema.Types.String, required: true, default: uuidv4 },
  name: { type: Schema.Types.String, required: true },
  address: { type: Schema.Types.String, required: false, default: '' },
  mail: { type: Schema.Types.String, required: true },
  pinCode: { type: Schema.Types.String, required: false, default: '' },
  shipTo: { type: Schema.Types.String, required: false, default: '' },
  billTo: { type: Schema.Types.String, required: false, default: '' },
  contact: { type: Schema.Types.String, required: false, default: '' },
  ...defaultFields
}, {
  ...defaultSchemaOptions
})

const Customer = mongoose.model('customer', CustomerSchema, 'customers')

module.exports = Customer
