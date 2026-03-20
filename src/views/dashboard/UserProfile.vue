<template>
  <div class="page-container">
    <el-card class="profile-card" v-loading="loading">
      <div class="profile-header">
        <div class="avatar-section">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleAvatarChange"
            accept="image/jpeg,image/png,image/webp"
          >
            <div class="avatar" v-if="!userInfo.avatarUrl">
              <span>{{ userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U' }}</span>
            </div>
            <el-avatar v-else :src="userInfo.avatarUrl" :size="120" class="avatar-img" />
            <el-button size="small" type="primary" plain class="change-avatar-btn">
              <el-icon><Camera /></el-icon>更换头像
            </el-button>
          </el-upload>
        </div>
        <div class="header-info">
          <div class="name-role-wrapper">
            <h3>{{ userInfo.name || '未设置姓名' }}</h3>
            <el-tag
              :type="userInfo.roleId === '2' ? 'danger' : 'info'"
              effect="dark"
              round
              class="role-badge"
            >
              {{ userInfo.roleName || '普通用户' }}
            </el-tag>
          </div>
          <p class="description">在这里管理您的个人信息和安全设置。</p>
        </div>
      </div>

      <el-divider border-style="dashed" />

      <div class="profile-body">
        <el-descriptions :column="2" border class="custom-descriptions">
          <el-descriptions-item label="用户 ID">
            <el-tag size="small" type="info">U-{{ userInfo.userId }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="邮箱账号">
            {{ userInfo.email }}
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">
            <el-icon><Calendar /></el-icon> {{ formatDate(userInfo.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="最后登录">
            <el-icon><Clock /></el-icon> {{ formatDate(userInfo.lastLoginAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="profile-actions">
        <el-button type="primary" :icon="Edit" @click="openProfileDialog" round size="large">
          编辑资料
        </el-button>
        <el-button type="warning" :icon="Lock" @click="openPasswordDialog" round size="large">
          修改密码
        </el-button>
        <el-button
          type="danger"
          :icon="SwitchButton"
          @click="handleLogout"
          round
          size="large"
          plain
        >
          退出登录
        </el-button>
      </div>
    </el-card>

    <!-- 编辑资料对话框 -->
    <el-dialog
      v-model="profileDialogVisible"
      title="编辑资料"
      width="500px"
      center
      destroy-on-close
    >
      <el-form :model="profileForm" :rules="profileRules" ref="profileFormRef" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="profileForm.name" :prefix-icon="User" placeholder="请输入您的姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="profileForm.email"
            :prefix-icon="Message"
            placeholder="请输入您的邮箱"
          />
        </el-form-item>
        <el-form-item label="原密码" prop="password" v-if="isEmailChanged">
          <el-input
            v-model="profileForm.password"
            type="password"
            show-password
            :prefix-icon="Lock"
            placeholder="修改邮箱需验证原密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="profileDialogVisible = false" round>取消</el-button>
          <el-button type="primary" @click="submitProfile" :loading="submitting" round>
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="450px"
      center
      destroy-on-close
    >
      <el-form
        :model="passwordForm"
        :rules="passwordRules"
        ref="passwordFormRef"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            :prefix-icon="Lock"
            placeholder="请输入原密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            :prefix-icon="Key"
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            :prefix-icon="Select"
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false" round>取消</el-button>
          <el-button type="warning" @click="submitPassword" :loading="submitting" round>
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit,
  Lock,
  Camera,
  User,
  Message,
  Key,
  Select,
  Calendar,
  Clock,
  SwitchButton,
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import { getUserInfo, updateProfile, updateAvatar, updatePassword } from '@/api/user_api'
import { logout } from '@/api/login_api'
import type { UploadFile } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)

const userInfo = ref({
  userId: '',
  name: '',
  email: '',
  roleId: '',
  roleName: '',
  avatarUrl: '',
  createdAt: '',
  lastLoginAt: '',
})

const fetchUserInfo = async () => {
  loading.value = true
  try {
    const res = await getUserInfo()
    if (res.ok) {
      userInfo.value = res.data
      // 更新本地存储的用户信息
      const localUser = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem(
        'user',
        JSON.stringify({ ...localUser, name: res.data.name, email: res.data.email }),
      )
    } else {
      ElMessage.error(res.message || '获取用户信息失败')
    }
  } catch {
    ElMessage.error('网络错误，无法获取用户信息')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return dateStr.replace('T', ' ')
}

// === 头像修改 ===
const handleAvatarChange = async (uploadFile: UploadFile) => {
  const file = uploadFile.raw
  if (!file) return

  const isSupported = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isSupported) {
    ElMessage.error('仅支持 jpg/png/webp 格式的图片!')
    return
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return
  }

  loading.value = true
  try {
    const res = await updateAvatar(file)
    if (res.ok) {
      ElMessage.success('头像修改成功')
      userInfo.value.avatarUrl = res.data.avatarUrl
    } else {
      ElMessage.error(res.message || '头像修改失败')
    }
  } catch {
    ElMessage.error('网络错误，头像修改失败')
  } finally {
    loading.value = false
  }
}

// === 编辑资料 ===
const profileDialogVisible = ref(false)
const profileFormRef = ref<FormInstance>()
const profileForm = reactive({
  name: '',
  email: '',
  password: '',
})

const isEmailChanged = computed(() => {
  return profileForm.email !== userInfo.value.email
})

const profileRules = reactive<FormRules>({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  password: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (isEmailChanged.value && !value) {
          callback(new Error('修改邮箱需验证原密码'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
})

const openProfileDialog = () => {
  profileForm.name = userInfo.value.name
  profileForm.email = userInfo.value.email
  profileForm.password = ''
  profileDialogVisible.value = true
}

const submitProfile = async () => {
  if (!profileFormRef.value) return
  await profileFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const payload: { name: string; email?: string; password?: string } = {
          name: profileForm.name,
        }
        if (isEmailChanged.value) {
          payload.email = profileForm.email
          payload.password = profileForm.password
        }

        const res = await updateProfile(payload)
        if (res.ok) {
          ElMessage.success('资料修改成功')
          profileDialogVisible.value = false
          await fetchUserInfo()
        } else {
          ElMessage.error(res.message || '修改失败')
        }
      } catch {
        ElMessage.error('网络错误')
      } finally {
        submitting.value = false
      }
    }
  })
}

// === 修改密码 ===
const passwordDialogVisible = ref(false)
const passwordFormRef = ref<FormInstance>()
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validateConfirmPassword = (
  rule: unknown,
  value: string,
  callback: (error?: Error) => void,
) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const passwordRules = reactive<FormRules>({
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
    { pattern: /(?=.*[a-zA-Z])(?=.*[0-9])/, message: '密码需包含字母和数字', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
})

const openPasswordDialog = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordDialogVisible.value = true
}

const submitPassword = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const res = await updatePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        })
        if (res.ok) {
          ElMessage.success('密码修改成功，请重新登录')
          passwordDialogVisible.value = false
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.push('/login')
        } else {
          ElMessage.error(res.message || '修改失败')
        }
      } catch {
        ElMessage.error('网络错误')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      loading.value = true
      try {
        await logout()
      } catch {
        // 即使接口调用失败，本地也进行登出操作
      } finally {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
        loading.value = false
      }
    })
    .catch(() => {
      // 取消操作
    })
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.page-container {
  padding: 24px;
  min-height: 100%;
}

.profile-card {
  border-radius: 12px;
  margin: 0 auto;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 20px 40px;
}

.avatar-section {
  text-align: center;
  flex-shrink: 0;
}

.avatar-uploader {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
}

:deep(.el-upload) {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  color: white;
  font-weight: bold;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(118, 75, 162, 0.3);
  flex-shrink: 0;
}

.avatar-img {
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.change-avatar-btn {
  margin-top: 12px;
  width: 100%;
}

.header-info {
  flex: 1;
}

.name-role-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.header-info h3 {
  margin: 0;
  font-size: 2rem;
  color: #333;
  font-weight: 600;
}

.role-badge {
  font-size: 14px;
  padding: 0 12px;
}

.description {
  color: #666;
  margin: 0;
  line-height: 1.5;
  font-size: 1.1rem;
}

.profile-body {
  margin: 20px 40px 40px;
  flex: 1;
}

.custom-descriptions {
  margin-top: 20px;
}

:deep(.el-descriptions__body) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-descriptions__label) {
  width: 150px;
  font-weight: bold;
  color: #606266;
  background-color: #fafafa !important;
}

:deep(.el-descriptions__content) {
  font-size: 15px;
  color: #303133;
}

.profile-actions {
  display: flex;
  gap: 24px;
  justify-content: center;
  padding: 40px 0;
  margin-top: auto;
}
</style>
