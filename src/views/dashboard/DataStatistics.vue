<template>
  <div class="page-container">
    <h2>数据统计仪表盘</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>总检测数</h3>
        <p class="number">1,234</p>
      </div>
      <div class="stat-card">
        <h3>异常发现</h3>
        <p class="number danger">56</p>
      </div>
      <div class="stat-card">
        <h3>处理进度</h3>
        <p class="number">89%</p>
      </div>
    </div>
    <div class="content-placeholder">
      <p>图表区域预留 (ECharts / Chart.js)</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 预留接口引入位置
// import { fetchStats } from '@/api/stats'
</script>

<style scoped>
.page-container {
  background: transparent;
  min-height: 100%;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}
.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.stat-card h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 0.9rem;
}
.number {
  font-size: 1.8rem;
  font-weight: bold;
  color: #1890ff;
  margin: 0;
}
.number.danger {
  color: #ff4d4f;
}
.content-placeholder {
  background: white;
  padding: 40px;
  border-radius: 8px;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed #ddd;
  color: #999;
}
</style>
