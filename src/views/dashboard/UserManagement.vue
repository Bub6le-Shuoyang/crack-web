<template>
  <div class="user-management-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="请输入用户名或邮箱搜索"
              class="search-input"
              clearable
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            >
              <template #append>
                <el-button @click="handleSearch">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <!-- 用户列表表格 -->
      <el-table :data="userList" v-loading="loading" style="width: 100%" border>
        <el-table-column prop="userId" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="roleName" label="角色" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.roleId === '2' ? 'danger' : 'info'">
              {{ scope.row.roleName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="(val: number | string | boolean) => handleStatusChange(scope.row, Number(val))"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.lastLoginAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="openEditDialog(scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="warning" link @click="openResetPasswordDialog(scope.row)">
              重置密码
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalUsers"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 编辑用户信息对话框 -->
    <el-dialog v-model="editDialogVisible" title="修改用户信息" width="500px">
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="editForm.roleId" placeholder="请选择角色" style="width: 100%">
            <el-option label="普通用户" value="1" />
            <el-option label="管理员" value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog v-model="resetPwdDialogVisible" title="重置用户密码" width="400px">
      <el-form :model="resetPwdForm" :rules="resetRules" ref="resetPwdFormRef" label-width="90px">
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="resetPwdForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPwdDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitResetPassword" :loading="submitting"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { listUsers, updateUser, changeUserStatus, resetPassword } from '@/api/admin_api'
import type { FormInstance, FormRules } from 'element-plus'

// 列表数据
const loading = ref(false)
const userList = ref<any[]>([])
const totalUsers = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await listUsers({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
    })
    if (res.ok) {
      userList.value = res.data.list || []
      totalUsers.value = res.data.total || 0
    } else {
      ElMessage.error(res.message || '获取用户列表失败')
    }
  } catch (error: any) {
    ElMessage.error('网络错误或无权限')
  } finally {
    loading.value = false
  }
}

// 格式化时间，处理后端的 ISO 格式 (如 2026-03-20T22:45:29)
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return dateStr.replace('T', ' ')
}

// 搜索、分页处理
const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchUsers()
}
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchUsers()
}

// 状态切换（启用/禁用）
const handleStatusChange = async (row: any, val: number) => {
  try {
    const res = await changeUserStatus(row.userId, val)
    if (res.ok) {
      ElMessage.success(res.message || '状态修改成功')
    } else {
      // 失败则恢复原状态
      row.status = val === 1 ? 0 : 1
      ElMessage.error(res.message || '修改失败')
    }
  } catch (error) {
    row.status = val === 1 ? 0 : 1
    ElMessage.error('网络错误')
  }
}

// === 编辑用户相关 ===
const editDialogVisible = ref(false)
const submitting = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  userId: '',
  name: '',
  email: '',
  roleId: '1',
})
const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
})

const openEditDialog = (row: any) => {
  editForm.userId = row.userId
  editForm.name = row.name
  editForm.email = row.email
  editForm.roleId = row.roleId ? String(row.roleId) : '1'
  editDialogVisible.value = true
}

const submitEdit = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const res = await updateUser(editForm.userId, {
          name: editForm.name,
          email: editForm.email,
          roleId: editForm.roleId,
        })
        if (res.ok) {
          ElMessage.success('用户信息修改成功')
          editDialogVisible.value = false
          fetchUsers()
        } else {
          ElMessage.error(res.message || '修改失败')
        }
      } catch (error) {
        ElMessage.error('网络错误')
      } finally {
        submitting.value = false
      }
    }
  })
}

// === 重置密码相关 ===
const resetPwdDialogVisible = ref(false)
const resetPwdFormRef = ref<FormInstance>()
const resetPwdForm = reactive({
  userId: '',
  newPassword: '',
})
const resetRules = reactive<FormRules>({
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
  ],
})

const openResetPasswordDialog = (row: any) => {
  resetPwdForm.userId = row.userId
  resetPwdForm.newPassword = ''
  resetPwdDialogVisible.value = true
}

const submitResetPassword = async () => {
  if (!resetPwdFormRef.value) return
  await resetPwdFormRef.value.validate(async (valid) => {
    if (valid) {
      ElMessageBox.confirm('确定要重置该用户的密码吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          submitting.value = true
          try {
            const res = await resetPassword(resetPwdForm.userId, resetPwdForm.newPassword)
            if (res.ok) {
              ElMessage.success(res.message || '密码重置成功')
              resetPwdDialogVisible.value = false
            } else {
              ElMessage.error(res.message || '重置失败')
            }
          } catch (error) {
            ElMessage.error('网络错误')
          } finally {
            submitting.value = false
          }
        })
        .catch(() => {})
    }
  })
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management-container {
  padding: 24px;
  min-height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
