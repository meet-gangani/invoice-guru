const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const { Schema } = mongoose
const { defaultFields, defaultSchemaOptions } = require('./model-utils')

const categoryschema = new Schema({
  _id: { type: Schema.Types.String, required: true, default: uuidv4 },
  categoryName: { type: Schema.Types.String, required: true },
  categoryIcon: { type: Schema.Types.String, required: true },
  status: { type: Schema.Types.String, required: true },
  ...defaultFields
}, {
  ...defaultSchemaOptions
})

const Category = mongoose.model('category', categoryschema, 'categories')

module.exports = Category
