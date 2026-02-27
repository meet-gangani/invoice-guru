import axiosInstance from './axiosInstance'

export default class featureService {

  static async getFeatureList() {
    try{
      const response = await axiosInstance.get('/v1/feature-list')
      return response.data
    }catch (error) {
      console.log(error.message)
    }
  }

  static async updateFeature(updateInfo){
    try{
      const response = await axiosInstance.put('/v1/feature/update-order', updateInfo)
      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }
}
