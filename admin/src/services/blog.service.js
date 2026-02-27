import axiosInstance from './axiosInstance'

export default class blogService {
  static async getBlogList(page, limit) {
    try {
      const response = await axiosInstance.get(`/v1/blogs?page=${page}&limit=${limit}`)

      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }

  static async getBlog(slug) {
    try {
      const response = await axiosInstance.get(`/v1/blog/${slug}`)

      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }

  static async createBlogs(blog) {
    {
      try {
        const response = await axiosInstance.post('/v1/blogs/create', {
          ...blog
        })

        return response.data
      } catch (error) {
        console.log(error.message)
      }
    }
  }

  static async updateBlog(blogId, blog) {
    try {
      const response = await axiosInstance.put(`/v1/blogs/${blogId}`, {
        ...blog
      })

      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }

  static async uploadBlogThumbnailMedia(files, blogId) {
    try {
      const formData = new FormData()
      formData.append('file', files[0])
      formData.append('id', blogId)

      const response = await axiosInstance.post('/v1/blogs/upload-thumbnail', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }

  static async deleteBlog(blogId) {
    try {
      const response = await axiosInstance.delete(`/v1/blogs/${blogId}`)

      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }

}
