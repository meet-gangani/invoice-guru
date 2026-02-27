const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const { Schema } = mongoose
const { defaultFields, defaultSchemaOptions } = require('./model-utils')

const blogSchema = new Schema({
  _id: { type: Schema.Types.String, required: true, default: uuidv4 },
  blogTitle: { type: Schema.Types.String, required: true },
  shortDescription: { type: Schema.Types.String, required: true },
  blogImage: { type: Schema.Types.String, required: false },
  description: { type: Schema.Types.String, required: true },
  slug: { type: Schema.Types.String, required: true },
  releaseDate: { type: Schema.Types.String, required: true, default: () => new Date().toISOString().split('T')[0] },
  ...defaultFields
}, {
  ...defaultSchemaOptions
})

const Blog = mongoose.model('blog', blogSchema, 'blogs')

module.exports = Blog
