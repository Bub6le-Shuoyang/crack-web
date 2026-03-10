<template>
  <div class="page-container">
    <h2>个人信息中心</h2>
    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar-wrapper">
          <div class="avatar">
            <span>Admin</span>
          </div>
          <button class="change-avatar-btn">更换头像</button>
        </div>
        <div class="header-info">
          <h3>Admin User</h3>
          <p class="role-badge">系统管理员</p>
          <p class="description">负责系统日常维护与异常检测监控。</p>
        </div>
      </div>

      <div class="profile-body">
        <div class="info-group">
          <label>用户 ID</label>
          <p>U-2023001</p>
        </div>
        <div class="info-group">
          <label>邮箱账号</label>
          <p>admin@example.com</p>
        </div>
        <div class="info-group">
          <label>手机号码</label>
          <p>13800138000</p>
        </div>
        <div class="info-group">
          <label>注册时间</label>
          <p>2023-01-01 10:00:00</p>
        </div>
        <div class="info-group">
          <label>最后登录</label>
          <p>2023-10-27 15:30:00</p>
        </div>
      </div>

      <div class="profile-actions">
        <button class="edit-btn">编辑资料</button>
        <button class="password-btn">修改密码</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 预留接口引入位置
// import { getUserProfile } from '@/api/user'
</script>

<style scoped>
.page-container {
  padding: 24px;
  min-height: 100%;
}

h2 {
  margin-bottom: 24px;
  color: #333;
}

.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 40px;
}

.avatar-wrapper {
  text-align: center;
}

.avatar {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  color: white;
  font-weight: bold;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(118, 75, 162, 0.3);
}

.change-avatar-btn {
  background: none;
  border: none;
  color: #1890ff;
  cursor: pointer;
  font-size: 0.9rem;
}

.header-info h3 {
  margin: 0 0 10px 0;
  font-size: 1.8rem;
  color: #333;
}

.role-badge {
  display: inline-block;
  background-color: #e6f7ff;
  color: #1890ff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.description {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.profile-body {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  margin-bottom: 40px;
}

.info-group label {
  display: block;
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.info-group p {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 500;
}

.profile-actions {
  display: flex;
  gap: 16px;
}

.edit-btn,
.password-btn {
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-btn {
  background-color: #1890ff;
  color: white;
  border: none;
}

.edit-btn:hover {
  background-color: #40a9ff;
}

.password-btn {
  background-color: white;
  color: #666;
  border: 1px solid #d9d9d9;
}

.password-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}
</style>
