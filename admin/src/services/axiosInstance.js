import axios from 'axios'
import encryptStorage from './storage'

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const errorMessages = [
  'jwt expired',
  'Token has expired',
  'No token found'
]

axiosInstance.interceptors.request.use((config) => {
  const decryptedString = encryptStorage.getItem('token')
  config.headers.Authorization = decryptedString

  return config
})

axiosInstance.interceptors.response.use((response) => response, (error) => {
  if (errorMessages.includes(error?.response?.data?.error)) {
    encryptStorage.removeItem('token')
    window.open("http://localhost:3000/login")
  }

  return error
})

export default axiosInstance
