import axiosInstance from './axiosInstance'

export default class trendingService {

  static async getTrendingList() {
    try{
      const response = await axiosInstance.get('/v1/trending-list')
      return response.data
    }catch (error) {
      console.log(error.message)
    }
  }

  static async updateTrending(updateInfo){
    try{
      const response = await axiosInstance.put('/v1/trending/update-order', updateInfo)
      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }
}
