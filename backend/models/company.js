const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const { Schema } = mongoose
const { defaultFields, defaultSchemaOptions } = require('./model-utils')

const CompanySchema = new Schema({
  _id: { type: Schema.Types.String, required: true, default: uuidv4 },
  name: { type: Schema.Types.String, required: true },
  logo: { type: Schema.Types.String, required: false, default: '' },
  username: { type: Schema.Types.String, required: true },
  password: { type: Schema.Types.String, required: true },
  status: { type: Schema.Types.String, required: true, default: 'ACTIVE' },
  ...defaultFields
}, {
  ...defaultSchemaOptions
})

const Category = mongoose.model('company', CompanySchema, 'companies')

module.exports = Category
