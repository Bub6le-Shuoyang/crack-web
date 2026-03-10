<template>
  <div class="login-container">
    <!-- 背景装饰球 -->
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <div class="auth-box">
      <div class="tabs">
        <button :class="{ active: currentView === 'login' }" @click="currentView = 'login'">
          登录
        </button>
        <button :class="{ active: currentView === 'register' }" @click="currentView = 'register'">
          注册
        </button>
      </div>

      <!-- 登录表单 -->
      <div v-if="currentView === 'login'" class="form-section">
        <h2>欢迎回来</h2>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label>邮箱账号</label>
            <input type="email" v-model="loginForm.email" required placeholder="请输入邮箱" />
          </div>
          <div class="form-group">
            <label>密码</label>
            <div class="password-wrapper">
              <input
                :type="showPassword.login ? 'text' : 'password'"
                v-model="loginForm.password"
                required
                placeholder="请输入密码"
              />
              <span class="eye-icon" @click="showPassword.login = !showPassword.login">
                <svg
                  v-if="showPassword.login"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  ></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </span>
            </div>
          </div>
          <div class="actions">
            <a href="#" @click.prevent="currentView = 'forgot'">忘记密码?</a>
          </div>
          <button type="submit" class="submit-btn">登录</button>
        </form>
      </div>

      <!-- 注册表单 -->
      <div v-if="currentView === 'register'" class="form-section">
        <h2>创建新账号</h2>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label>用户姓名</label>
            <input type="text" v-model="registerForm.name" required placeholder="请输入姓名" />
          </div>
          <div class="form-group">
            <label>邮箱账号</label>
            <div class="input-with-btn">
              <input type="email" v-model="registerForm.email" required placeholder="请输入邮箱" />
              <button type="button" @click="sendCode(registerForm.email)" :disabled="codeSent">
                {{ codeSent ? '已发送' : '获取验证码' }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>验证码</label>
            <input type="text" v-model="registerForm.code" required placeholder="请输入验证码" />
          </div>
          <div class="form-group">
            <label>设置密码</label>
            <div class="password-wrapper">
              <input
                :type="showPassword.register ? 'text' : 'password'"
                v-model="registerForm.password"
                required
                placeholder="请输入密码"
              />
              <span class="eye-icon" @click="showPassword.register = !showPassword.register">
                <svg
                  v-if="showPassword.register"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  ></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </span>
            </div>
          </div>
          <div class="form-group">
            <label>确认密码</label>
            <div class="password-wrapper">
              <input
                :type="showPassword.registerConfirm ? 'text' : 'password'"
                v-model="registerForm.confirmPassword"
                required
                placeholder="请再次输入密码"
              />
              <span
                class="eye-icon"
                @click="showPassword.registerConfirm = !showPassword.registerConfirm"
              >
                <svg
                  v-if="showPassword.registerConfirm"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  ></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </span>
            </div>
          </div>
          <button type="submit" class="submit-btn">注册</button>
        </form>
      </div>

      <!-- 找回密码表单 -->
      <div v-if="currentView === 'forgot'" class="form-section">
        <h2>找回密码</h2>
        <p class="back-link" @click="currentView = 'login'">&larr; 返回登录</p>
        <form @submit.prevent="handleReset">
          <div class="form-group">
            <label>邮箱账号</label>
            <div class="input-with-btn">
              <input type="email" v-model="forgotForm.email" required placeholder="请输入邮箱" />
              <button type="button" @click="sendCode(forgotForm.email)" :disabled="codeSent">
                {{ codeSent ? '已发送' : '获取验证码' }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>验证码</label>
            <input type="text" v-model="forgotForm.code" required placeholder="请输入验证码" />
          </div>
          <div class="form-group">
            <label>新密码</label>
            <div class="password-wrapper">
              <input
                :type="showPassword.forgot ? 'text' : 'password'"
                v-model="forgotForm.newPassword"
                required
                placeholder="请输入新密码"
              />
              <span class="eye-icon" @click="showPassword.forgot = !showPassword.forgot">
                <svg
                  v-if="showPassword.forgot"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  ></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </span>
            </div>
          </div>
          <div class="form-group">
            <label>确认新密码</label>
            <div class="password-wrapper">
              <input
                :type="showPassword.forgotConfirm ? 'text' : 'password'"
                v-model="forgotForm.confirmNewPassword"
                required
                placeholder="请再次输入新密码"
              />
              <span
                class="eye-icon"
                @click="showPassword.forgotConfirm = !showPassword.forgotConfirm"
              >
                <svg
                  v-if="showPassword.forgotConfirm"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  ></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </span>
            </div>
          </div>
          <button type="submit" class="submit-btn">提交验证并重置</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { login, register, sendVerificationCode, resetPassword } from '@/api/login_api'

const router = useRouter()
const currentView = ref<'login' | 'register' | 'forgot'>('login')
const codeSent = ref(false)

const showPassword = reactive({
  login: false,
  register: false,
  registerConfirm: false,
  forgot: false,
  forgotConfirm: false,
})

const loginForm = reactive({
  email: '',
  password: '',
})

const registerForm = reactive({
  name: '',
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
})

const forgotForm = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmNewPassword: '',
})

const handleLogin = async () => {
  try {
    const res = await login({
      email: loginForm.email,
      password: loginForm.password,
    })

    if (res.token) {
      // 登录成功
      // 可以保存 token 到 localStorage 或 Pinia
      localStorage.setItem('token', res.token)
      if (res.user) {
        localStorage.setItem('user', JSON.stringify(res.user))
      }
      router.push('/dashboard')
    } else if (res.error) {
      alert(res.message || '登录失败')
    } else {
      alert('登录失败: 未知错误')
    }
  } catch (error) {
    const err = error as { message?: string }
    alert(err.message || '登录请求失败')
  }
}

const handleRegister = async () => {
  if (registerForm.password !== registerForm.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  try {
    const res = await register({
      email: registerForm.email,
      password: registerForm.password,
      name: registerForm.name,
      verificationCode: registerForm.code,
    })

    if (res.ok) {
      alert(res.message || '注册成功，请登录')
      currentView.value = 'login'
    } else if (res.error) {
      alert(res.message || '注册失败')
    } else {
      alert('注册失败')
    }
  } catch (error) {
    const err = error as { message?: string }
    alert(err.message || '注册请求失败')
  }
}

const sendCode = async (email: string) => {
  if (!email) {
    alert('请输入邮箱')
    return
  }
  try {
    const res = await sendVerificationCode(email)

    if (res.ok) {
      codeSent.value = true
      setTimeout(() => {
        codeSent.value = false
      }, 60000) // 60s cooldown mock
      alert(res.message || '验证码已发送')
    } else if (res.error) {
      alert(res.message || '发送失败')
    }
  } catch (error) {
    const err = error as { message?: string }
    alert(err.message || '验证码发送请求失败')
  }
}

const handleReset = async () => {
  if (forgotForm.newPassword !== forgotForm.confirmNewPassword) {
    alert('两次输入的新密码不一致')
    return
  }
  try {
    const res = await resetPassword({
      email: forgotForm.email,
      verificationCode: forgotForm.code,
      newPassword: forgotForm.newPassword,
    })

    if (res.ok) {
      alert(res.message || '密码重置成功，请使用新密码登录')
      currentView.value = 'login'
    } else if (res.error) {
      alert(res.message || '操作失败')
    }
  } catch (error) {
    const err = error as { message?: string }
    alert(err.message || '重置密码请求失败')
  }
}
</script>

<style scoped>
@import '@/assets/css/login.css';
</style>
