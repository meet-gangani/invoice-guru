import axiosInstance from './axiosInstance'

export default class pageService {
  static async fetchPage(pageId) {
    try {
      const response = await axiosInstance.get(`/v1/page/${pageId}`)
      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }

  static async updatePage(pageId, description) {
    try {
      const response = await axiosInstance.put(`/v1/pages/${pageId}`, { description })
      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }
}
