import axios from 'axios'
import encryptStorage from './storage'

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const STATUS_CODE = {
  UNAUTHORIZED: 401,
}

axiosInstance.interceptors.request.use((config) => {
  const decryptedString = encryptStorage.getItem('token')
  config.headers.Authorization = decryptedString

  return config
})

axiosInstance.interceptors.response.use((response) => response, (error) => {
  if (error?.response.status === STATUS_CODE.UNAUTHORIZED) {
    encryptStorage.removeItem('token')

    window.open(`${window.location.origin}/login`)
  }

  return error
})

export default axiosInstance
