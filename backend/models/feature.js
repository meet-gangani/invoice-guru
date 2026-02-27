const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const { Schema } = mongoose
const { defaultFields, defaultSchemaOptions } = require('./model-utils')

const featureSchema = new Schema({
  _id: { type: Schema.Types.String, required: true, default: uuidv4 },
  position: { type: Schema.Types.Number, required: true },
  gameId: { type: Schema.Types.String, required: true },
  ...defaultFields
}, {
  ...defaultSchemaOptions
})

const Feature = mongoose.model('feature', featureSchema, 'features')

module.exports = Feature
