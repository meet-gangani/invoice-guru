import axiosInstance from './axiosInstance'

export default class categoryService {

  static async getCategoryList() {
    try {
      const response = await axiosInstance.get('/v1/categories')
      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }

  static async getActiveCategoryList() {
    try {
      const response = await axiosInstance.get('/v1/categories/active-category')
      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }

  static async getCategory(id) {
    try {
      const response = await axiosInstance.get(`/v1/categories/${id}`)

      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }

  static async createCategory(category) {
    try {
      const response = await axiosInstance.post('./v1/categories/add-category', { ...category })
      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }

  static async uploadCategoryIcon(files, gameId) {
    try {
      const formData = new FormData()
      formData.append('file', files[0])
      formData.append('id', gameId)

      const response = await axiosInstance.post('/v1/categories/upload-icon', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }

  static async updateCategory(id, category) {
    try {
      const response = await axiosInstance.put(`/v1/categories/${id}`, { ...category })
      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }

  static async deleteCategory(id) {
    const response = await axiosInstance.delete(`/v1/categories/${id}`)
    return response.data
  }

  catch(error) {
    console.log(error.message)
  }
}
