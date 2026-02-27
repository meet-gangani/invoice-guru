const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const { Schema } = mongoose
const { defaultFields, defaultSchemaOptions } = require('./model-utils')

const pageSchema = new Schema({
  _id: { type: Schema.Types.String, required: true, default: uuidv4 },
  description: { type: Schema.Types.String, required: true },
  details: { type: Schema.Types.Mixed, required: true },
  ...defaultFields
}, {
  ...defaultSchemaOptions
})

const PageStore = mongoose.model('page', pageSchema, 'pages')

module.exports = PageStore
