const { BlogStore } = require('../models')
const { sendSuccess, sendError } = require('./utils')
const fs = require("fs");
const path = require("path");

const maxFileUploadSize =
    2048 * 1024 * 1024 || process.env.MAX_FILE_UPLOAD_SIZE; // default 2 GB

const createBlog = async (req, res) => {
  try {
    const blogInfo = req.body

    req.body.slug = req.body.blogTitle
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");

    const Blogs = await BlogStore.find().sort({ createdOn: -1 });

    let checkSlug = Blogs.some((blog) => blog.slug === req.body.slug);

    if (checkSlug) {
      let slugBase = req.body.slug;
      let counter = 1;

      while (checkSlug) {
        req.body.slug = `${slugBase}-${counter}`;
        checkSlug = Blogs.some((blog) => blog.slug === req.body.slug);
        counter++;
      }
    }

    if (!blogInfo) {
      return sendError(res, 'blog not found', null, 404)
    }

    const blog = await BlogStore.create(blogInfo)

    return sendSuccess(res, { blog })
  } catch (error) {
    return sendError(res, 'Error while adding blog', error)
  }
}

const getBlog = async (req, res) => {
  try {
    const slug = req.params.slug;

    if (!slug) {
      return sendError(res, 'blogId not found', null, 404)
    }

    const blog = await BlogStore.findOne({ slug: slug })

    return sendSuccess(res, { blog })
  } catch (error) {
    return sendError(res, 'Error while getting blog', error)
  }
}

const getBlogList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      return sendError(res, "Invalid pagination parameters");
    }

    const totalBlogs = await BlogStore.countDocuments();
    const totalPages = Math.ceil(totalBlogs / limitNumber);

    if (pageNumber > totalPages && totalPages > 0) {
      return sendError(res, "Page number exceeds total pages");
    }

    const blogs = await BlogStore.find().sort({ createdOn: -1 }).skip((pageNumber - 1) * limitNumber).limit(limitNumber);
    return sendSuccess(res, {
      blogs,
      currentPage: pageNumber,
      totalPages,
      totalBlogs,
      perPage: limitNumber,
    })
  } catch (error) {
    return sendError(res, 'can\'t find blog list', error)
  }
}

const updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id
    const { blogTitle, blogImage, shortDescription, description, slug, releaseDate } = req.body

    if (!blogId) {
      return sendError(res, 'invalid blog id', null, 404)
    }

    let newSlug = blogTitle
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");

    // Fetch all blogs excluding the current blog being updated
    const blogs = await BlogStore.find({ _id: { $ne: blogId } });

    // Check for duplicate slugs
    let isDuplicateSlug = blogs.some((blog) => blog.slug === newSlug);
    if (isDuplicateSlug) {
      let slugBase = newSlug;
      let counter = 1;

      while (isDuplicateSlug) {
        newSlug = `${slugBase}-${counter}`;
        isDuplicateSlug = blogs.some((blog) => blog.slug === newSlug);
        counter++;
      }
    }

    const updateBlog = await BlogStore.updateOne({ _id: blogId }, { blogTitle, blogImage, shortDescription, description, releaseDate, slug: newSlug })

    if (!updateBlog) {
      return sendError(res, 'blog not found', null, 404)
    }

    return sendSuccess(res, {
      slug: newSlug,
      message: 'blog updated successfully'
    })
  } catch (error) {
    return sendError(res, 'internal server error', error, 404)
  }
}

const uploadBlogThumbnail = async (req, res) => {
  try {
    const blogId = req.body.id;
    const file = req.files.file;

    const allowTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowTypes.includes(file.mimetype) || file.size > maxFileUploadSize)
      return sendError(res, "Error : Invalid file format or size.", null, 400);

    const blog = await BlogStore.findOne({ _id: blogId });
    if (!blog) return sendError(res, "Blog not found.", null, 404);

    // Delete the previous thumbnail if it exists
    if (blog?.blogImage) {
      const oldFilePath = path.join(__dirname, "..", blog?.blogImage);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath); // Delete the file
        console.log("✅ Previous thumbnail deleted:", oldFilePath);
      }
    }

    const fileExtension = file.name.split(".").pop();
    const timestamp = Date.now();
    const sanitizedBlogName = blog.blogTitle.replaceAll(" ", "_");

    const filename = `${sanitizedBlogName}_${timestamp}.${fileExtension}`;

    const filePath = req.directoryPathToStore + filename;
    await file.mv(filePath);

    sendSuccess(res, {
      // url: `http://localhost:${process.env.PORT}/` + filePath,
      url: `https://api.emoongames.com/` + filePath,
      message: "File uploaded successfully",
    });
  } catch (error) {
    sendError(res, "Error while fetching upload Blog Thumbnail Media.", error);
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id

    const deleteBlog = await BlogStore.findByIdAndDelete(blogId)

    if (!deleteBlog) {
      return sendError(res, 'blog not found', null, 404)
    }

    return sendSuccess(res, { deleteBlog })
  } catch (error) {
    return sendError(res, 'Internal server error', error, 404)
  }
}

module.exports = {
  createBlog,
  getBlogList,
  getBlog,
  updateBlog,
  uploadBlogThumbnail,
  deleteBlog
}
