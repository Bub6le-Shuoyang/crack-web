<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Crack Admin</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/dashboard/detection-image" class="nav-item" active-class="active">
          <span class="icon">🖼️</span> 道路异常检测-图片
        </router-link>
        <router-link to="/dashboard/detection-video" class="nav-item" active-class="active">
          <span class="icon">🎥</span> 道路异常检测-视频
        </router-link>
        <router-link to="/dashboard/statistics" class="nav-item" active-class="active">
          <span class="icon">📊</span> 数据统计仪表盘
        </router-link>
        <router-link to="/dashboard/profile" class="nav-item" active-class="active">
          <span class="icon">👤</span> 个人信息中心
        </router-link>
        <router-link
          v-if="isAdmin"
          to="/dashboard/user-management"
          class="nav-item"
          active-class="active"
        >
          <span class="icon">👥</span> 用户管理
        </router-link>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部栏 -->
      <header class="topbar">
        <div class="breadcrumb">管理系统 / {{ currentRouteName }}</div>
        <div class="user-info">
          <span>{{ isAdmin ? '管理员' : '普通用户' }}</span>
          <button @click="handleLogout" class="logout-btn">退出</button>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="content-view">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { logout } from '@/api/login_api'

const router = useRouter()
const route = useRoute()
const isAdmin = ref(false)

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      // Check roleid (handling both string '2' and number 2, and potential field names)
      if (user.roleid == '2' || user.role_id == '2') {
        isAdmin.value = true
      }
    } catch (e) {
      console.error('Failed to parse user info', e)
    }
  }
})

const currentRouteName = computed(() => {
  switch (route.name) {
    case 'detection-image':
      return '道路异常检测-图片'
    case 'detection-video':
      return '道路异常检测-视频'
    case 'statistics':
      return '数据统计仪表盘'
    case 'profile':
      return '个人信息中心'
    case 'user-management':
      return '用户管理'
    default:
      return '首页'
  }
})

const handleLogout = async () => {
  await logout()
  // 清除token等逻辑
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.sidebar {
  width: 320px;
  background-color: #001529;
  color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #002140;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.sidebar-nav {
  padding: 1.5rem 0;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 16px 32px;
  color: #a6adb4;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.nav-item:hover {
  color: #fff;
  background-color: #1890ff;
}

.nav-item.active {
  color: #fff;
  background-color: #1890ff;
  border-right: 4px solid #fff;
}

.icon {
  margin-right: 10px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.topbar {
  height: 64px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 1;
}

.breadcrumb {
  font-size: 1rem;
  color: #666;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logout-btn {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.content-view {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>
