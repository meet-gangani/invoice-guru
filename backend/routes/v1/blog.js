const router = require('express').Router()
const blogFileUpload = require('../../middleware/BlogFileUpload')

const {
  createBlog,
  getBlog,
  getBlogList,
  updateBlog,
  deleteBlog,
  uploadBlogThumbnail
} = require('../../controllers/blog')

// User routes - /v1/games
router.get('/:slug', getBlog)
router.get('/', getBlogList)
router.post('/create', createBlog)
router.put('/:id', updateBlog)
router.delete('/:id', deleteBlog)
router.post('/upload-thumbnail', blogFileUpload, uploadBlogThumbnail)

module.exports = router
