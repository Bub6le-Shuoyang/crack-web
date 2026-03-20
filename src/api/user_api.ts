import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:7022'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// 请求拦截器：自动携带 Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const getUserInfo = async () => {
  const response = await apiClient.get('/api/user/info')
  return response.data
}

export const updateProfile = async (data: { name?: string; email?: string; password?: string }) => {
  const response = await apiClient.post('/api/user/update-profile', data)
  return response.data
}

export const updateAvatar = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post('/api/user/update-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export const updatePassword = async (data: { oldPassword?: string; newPassword?: string }) => {
  const response = await apiClient.post('/api/user/update-password', data)
  return response.data
}
