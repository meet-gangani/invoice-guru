const router = require('express').Router()
const categoryFileUpload = require('../../middleware/categoryFileUpload')

const {
  createCategory,
  getCategory,
  getCategoryList,
  getActiveCategoryList,
  updateCategory,
  uploadCategoryImage,
  deleteCategory
} = require('../../controllers/category')

// User routes - /v1/Categories
router.get('/', getCategoryList)
router.get('/active-category', getActiveCategoryList)
router.get('/:id', getCategory)
router.post('/add-category', createCategory)
router.put('/:id', updateCategory)
router.delete('/:id', deleteCategory)
router.post('/upload-icon', categoryFileUpload, uploadCategoryImage)

module.exports = router
