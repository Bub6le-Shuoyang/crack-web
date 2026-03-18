<template>
  <div class="video-detection-container">
    <el-card class="placeholder-card">
      <template #header>
        <div class="card-header">
          <span>道路异常检测 - 视频</span>
        </div>
      </template>
      <el-empty description="视频检测功能开发中..." />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 目前暂不添加功能
</script>

<style scoped>
.video-detection-container {
  padding: 20px;
}
.placeholder-card {
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.card-header {
  font-weight: bold;
}
</style>
