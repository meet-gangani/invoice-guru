const { CategoryStore } = require('../models')
const { sendSuccess, sendError } = require('./utils')
const fs = require("fs");
const path = require("path");
const { log } = require("console");

const backendUrl = 'https://api.emoongames.com';
// const backendUrl = 'http://localhost:5050';

const maxFileUploadSize = 1 * 1024 * 1024;

const createCategory = async (req, res) => {
  try {
    const categoryInfo = req.body

    if (!categoryInfo) {
      return sendError(res, 'category not found', null, 404)
    }

    const category = await CategoryStore.create(categoryInfo)

    return sendSuccess(res, { category })
  } catch (error) {
    return sendError(res, 'Error while adding category', error)
  }
}

const getCategory = async (req, res) => {
  try {
    const categoryId = req.params.id

    if (!categoryId) {
      return sendError(res, 'categoryId not found', null, 404)
    }

    const category = await CategoryStore.findById(categoryId)

    return sendSuccess(res, { category })
  } catch (error) {
    return sendError(res, 'Error while getting category', error)
  }
}

const getCategoryList = async (req, res) => {
  try {
    const categories = await CategoryStore.find().sort({
      createdOn: -1,
    })

    return sendSuccess(res, { categories })
  } catch (error) {
    return sendError(res, 'can\'t find category list', error)
  }
}

const getActiveCategoryList = async (req, res) => {
  try{
    const categories = await CategoryStore.find({ status: 'active' }).sort({
      createdOn: -1,
    })
    return sendSuccess(res, { categories })
  } catch (error) {
    return sendError(res, 'can\'t find category list', error)
  }
}

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id
    const { categoryName, categoryIcon, status } = req.body

    if (!categoryId) {
      return sendError(res, 'invalid category id', null, 404)
    }

    const updateCategory = await CategoryStore.updateOne({ _id: categoryId }, {
      categoryName, categoryIcon, status
    })

    if (!updateCategory) {
      return sendError(res, 'category not found', null, 404)
    }

    return sendSuccess(res, 'category updated successfully')
  } catch (error) {
    return sendError(res, 'internal server error', error, 404)
  }
}

const uploadCategoryImage = async (req, res) => {
  try {
    const categoryId = req.body.id;
    const file = req.files.file;

    const allowTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowTypes.includes(file.mimetype) || file.size > maxFileUploadSize)
      return sendError(res, "Error : Invalid file format or size.", null, 400);

    const category = await CategoryStore.findOne({ _id: categoryId });
    if (!category) return sendError(res, "Category not found.", null, 404);

    // Delete the previous categoryIcon if it exists
    if (category?.categoryIcon) {
      const oldFilePath = path.join(__dirname, "..", category?.categoryIcon);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath); // Delete the file
        console.log("✅ Previous icon deleted:", oldFilePath);
      }
    }

    const fileExtension = file.name.split(".").pop();
    const timestamp = Date.now();
    const sanitizedCategoryName = category.categoryName.replaceAll(" ", "_");

    const filename = `${sanitizedCategoryName}_${timestamp}.${fileExtension}`;

    const filePath = req.directoryPathToStore + filename;
    await file.mv(filePath);

    sendSuccess(res, {
      // url: `http://localhost:${process.env.PORT}/` + filePath,
      url:  `${backendUrl}/${filePath}`,
      message: "File uploaded successfully",
    });
  } catch (error) {
    sendError(res, "Error while fetching upload category icon Media.", error);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id

    const deleteCategory = await CategoryStore.findByIdAndDelete(categoryId)

    if (!deleteCategory) {
      return sendError(res, 'category not found', null, 404)
    }

    return sendSuccess(res, { deleteCategory })
  } catch (error) {
    return sendError(res, 'Internal server error', error, 404)
  }
}

module.exports = {
  createCategory,
  getCategory,
  getCategoryList,
  getActiveCategoryList,
  updateCategory,
  uploadCategoryImage,
  deleteCategory
}
