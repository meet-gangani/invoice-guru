const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const { Schema } = mongoose
const { defaultFields, defaultSchemaOptions } = require('./model-utils')
const jwt = require('jsonwebtoken')
const constants = require('../global')

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

CompanySchema.methods.generateAuthToken = function() {
  let token
  token = jwt.sign(
      {
        _id: this._id,
        isAdmin: false
      },
      constants.security.TOKEN_SECRET,
      { expiresIn: '7d' }
  )
  return token
}

const Company = mongoose.model('company', CompanySchema, 'companies')

module.exports = Company
