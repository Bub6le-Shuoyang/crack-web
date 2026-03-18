import axios from 'axios'

// 1. 设置全局 Base URL
// 也可以放到 .env 文件中: VITE_API_BASE_URL=http://127.0.0.1:7022
const API_BASE_URL = 'http://127.0.0.1:7022'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒超时
})

// 响应拦截器（可选：统一处理错误）
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 这里可以处理通用的错误，比如网络错误等
    // 为了让调用方能捕获并处理具体业务错误，这里还是reject出去
    return Promise.reject(error)
  },
)

// --- 类型定义 ---

export interface User {
  name: string
  email: string
  role_id?: string
  roleid?: string // 兼容注册接口返回的 roleid
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token?: string
  user?: User
  error?: boolean
  message?: string
  code?: string
}

export interface SendCodeRequest {
  email: string
}

export interface SendCodeResponse {
  ok?: boolean
  error?: boolean
  message?: string
  code?: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  verificationCode: string
}

export interface RegisterResponse {
  ok?: boolean
  message?: string
  user?: User
  error?: boolean
  code?: string
}

export interface ForgotPasswordRequest {
  email: string
  verificationCode: string
  newPassword: string
}

export interface ForgotPasswordResponse {
  ok?: boolean
  message?: string
  error?: boolean
  code?: string
}

export interface LogoutResponse {
  ok?: boolean
}

// --- API 方法 ---

// 1. 登录接口
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/api/user/login', data)
    return response.data
  } catch (error: unknown) {
    const err = error as { response?: { data?: LoginResponse } }
    if (err.response && err.response.data) {
      return err.response.data
    }
    throw error
  }
}

// 2. 发送验证码接口 (注册/找回密码复用)
export const sendVerificationCode = async (email: string): Promise<SendCodeResponse> => {
  try {
    const response = await apiClient.post<SendCodeResponse>('/api/user/send-verification-code', {
      email,
    })
    return response.data
  } catch (error: unknown) {
    const err = error as { response?: { data?: SendCodeResponse } }
    if (err.response && err.response.data) {
      return err.response.data
    }
    throw error
  }
}

// 3. 注册接口
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>('/api/user/register', data)
    return response.data
  } catch (error: unknown) {
    const err = error as { response?: { data?: RegisterResponse } }
    if (err.response && err.response.data) {
      return err.response.data
    }
    throw error
  }
}

// 4. 找回密码接口
export const resetPassword = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
  try {
    const response = await apiClient.post<ForgotPasswordResponse>('/api/user/forgot-password', data)
    return response.data
  } catch (error: unknown) {
    const err = error as { response?: { data?: ForgotPasswordResponse } }
    if (err.response && err.response.data) {
      return err.response.data
    }
    throw error
  }
}

// 5. 登出接口
export const logout = async (): Promise<LogoutResponse> => {
  try {
    const response = await apiClient.post<LogoutResponse>('/api/user/logout', {})
    return response.data
  } catch (error: unknown) {
    console.error('Logout failed:', error)
    return { ok: false }
  }
}
