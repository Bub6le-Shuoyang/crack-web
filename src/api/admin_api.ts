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

export const listUsers = async (params: { page: number; pageSize: number; keyword?: string }) => {
  const response = await apiClient.get('/api/admin/list-users', { params })
  return response.data
}

export const updateUser = async (userId: number | string, data: any) => {
  const response = await apiClient.post(`/api/admin/update-user/${userId}`, data)
  return response.data
}

export const resetPassword = async (userId: number | string, newPassword: string) => {
  const response = await apiClient.post(`/api/admin/reset-password/${userId}`, { newPassword })
  return response.data
}

export const changeUserStatus = async (userId: number | string, status: number) => {
  const response = await apiClient.post(`/api/admin/change-user-status/${userId}`, { status })
  return response.data
}
