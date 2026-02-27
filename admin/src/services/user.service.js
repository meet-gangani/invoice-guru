import encryptStorage from './storage'
import axiosInstance from './axiosInstance'

export default class UserService {
  static async login(email, password) {
    try {
      const response = await axiosInstance.post('/v1/login', {
        email,
        password
      })

      const token = response.data.token
      if (token) {
        encryptStorage.setItem('token', token)
      }

      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }

  static async changePassword(passwordInfo) {
    try {
      const response = await axiosInstance.put(`/v1/users/change-password`, passwordInfo)
      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }

  static async logout() {
    try {
      // const response = await axiosInstance.post('/logout');
      encryptStorage.removeItem('token')

      // return response.data;
    } catch (error) {
      console.log(error.message)
    }
  }
}
