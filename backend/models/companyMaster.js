const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const { Schema } = mongoose
const { defaultFields, defaultSchemaOptions } = require('./model-utils')

const CompanyMasterSchema = new Schema({
  _id: { type: Schema.Types.String, required: true, default: uuidv4 },
  company_id: { type: Schema.Types.String, required: false, ref: 'company' },
  name: { type: Schema.Types.String, required: true },
  logo: { type: Schema.Types.String, required: false, default: '' },
  username: { type: Schema.Types.String, required: true },
  owner: { type: Schema.Types.String, required: false, default: '' },
  contactPerson: { type: Schema.Types.String, required: false, default: '' },
  contactNumber: { type: Schema.Types.String, required: false, default: '' },
  address: { type: Schema.Types.String, required: false, default: '' },
  pinCode: { type: Schema.Types.String, required: false, default: '' },
  stamp: { type: Schema.Types.String, required: false, default: '' },
  sign: { type: Schema.Types.String, required: false, default: '' },
  ...defaultFields
}, {
  ...defaultSchemaOptions
})

const CompanyMaster = mongoose.model('companyMaster', CompanyMasterSchema, 'companiesMaster')

module.exports = CompanyMaster
