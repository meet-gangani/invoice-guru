import axiosInstance from './axiosInstance'

export default class EndpointService {

  // INVOICE
  static async dashboardCards() {
    try {
      const response = await axiosInstance.get('/v1/invoice/dashboard-cards')
      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }

  static async getInvoices() {
    try {
      const response = await axiosInstance.get('/v1/invoice')

      return response.data
    } catch (error) {
      console.log(error.message)
      return []
    }
  }


  // COMPANY

  static async getCompanyList() {
    try {
      const response = await axiosInstance.get('/v1/company')

      return response.data
    } catch (error) {
      console.log(error.message)
      return []
    }
  }

  static async createCompany(data) {
    try {
      const response = await axiosInstance.post('/v1/company/create', data)

      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }

  // MISC

}
