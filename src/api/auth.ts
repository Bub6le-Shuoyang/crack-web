// 这是一个预留的 API 接口文件
// 后期可以在这里接入真实的后端接口

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  email: string
  code: string
  password: string
}

export interface ForgotPasswordParams {
  email: string
  code: string
}

export const login = async (data: LoginParams) => {
  console.log('Login with:', data)
  // return request.post('/api/login', data)
  return Promise.resolve({ token: 'mock-token', user: { name: 'Admin' } })
}

export const register = async (data: RegisterParams) => {
  console.log('Register with:', data)
  // return request.post('/api/register', data)
  return Promise.resolve({ success: true })
}

export const sendVerificationCode = async (email: string) => {
  console.log('Send code to:', email)
  // return request.post('/api/send-code', { email })
  return Promise.resolve({ success: true })
}

export const resetPassword = async (data: ForgotPasswordParams) => {
  console.log('Reset password with:', data)
  // return request.post('/api/reset-password', data)
  return Promise.resolve({ success: true })
}
