<template>
  <div class="realtime-dashboard">
    <div class="header">
      <h3>实时监控面板</h3>
      <div class="actions">
        <el-tag type="info">更新时间: {{ formatTime(realtimeData.timestamp) }}</el-tag>
        <el-button type="primary" size="small" @click="$emit('refresh')">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 今日实时数据卡片 -->
    <div class="realtime-cards">
      <div class="realtime-card">
        <div class="card-icon" style="background: #e6f7ff">
          <el-icon :size="24" color="#1890ff"><User /></el-icon>
        </div>
        <div class="card-data">
          <span class="card-value">{{ realtimeData.newUsersToday || 0 }}</span>
          <span class="card-label">今日新用户</span>
        </div>
      </div>
      <div class="realtime-card">
        <div class="card-icon" style="background: #f6ffed">
          <el-icon :size="24" color="#52c41a"><UserFilled /></el-icon>
        </div>
        <div class="card-data">
          <span class="card-value">{{ realtimeData.activeUsersToday || 0 }}</span>
          <span class="card-label">今日活跃用户</span>
        </div>
      </div>
      <div class="realtime-card">
        <div class="card-icon" style="background: #fff7e6">
          <el-icon :size="24" color="#fa8c16"><Picture /></el-icon>
        </div>
        <div class="card-data">
          <span class="card-value">{{ realtimeData.imagesUploadedToday || 0 }}</span>
          <span class="card-label">今日图片上传</span>
        </div>
      </div>
      <div class="realtime-card">
        <div class="card-icon" style="background: #f9f0ff">
          <el-icon :size="24" color="#722ed1"><VideoCamera /></el-icon>
        </div>
        <div class="card-data">
          <span class="card-value">{{ realtimeData.videosUploadedToday || 0 }}</span>
          <span class="card-label">今日视频上传</span>
        </div>
      </div>
      <div class="realtime-card">
        <div class="card-icon" style="background: #e6fffb">
          <el-icon :size="24" color="#13c2c2"><Search /></el-icon>
        </div>
        <div class="card-data">
          <span class="card-value">{{ realtimeData.imagesDetectedToday || 0 }}</span>
          <span class="card-label">今日图片检测</span>
        </div>
      </div>
      <div class="realtime-card">
        <div class="card-icon" style="background: #fff0f6">
          <el-icon :size="24" color="#eb2f96"><WarningFilled /></el-icon>
        </div>
        <div class="card-data">
          <span class="card-value danger">{{ realtimeData.anomaliesToday || 0 }}</span>
          <span class="card-label">今日异常发现</span>
        </div>
      </div>
    </div>

    <!-- 今日存储增量 -->
    <div class="storage-increase">
      <el-icon><FolderOpened /></el-icon>
      <span>今日存储增量：</span>
      <strong>{{ realtimeData.storageIncreaseTodayFormatted || '0 B' }}</strong>
    </div>

    <!-- 今日小时趋势 -->
    <div class="hourly-trend">
      <h3>今日小时趋势</h3>
      <v-chart class="chart" :option="hourlyChartOption" autoresize />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { Refresh, User, UserFilled, Picture, VideoCamera, Search, WarningFilled, FolderOpened } from '@element-plus/icons-vue'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent])

defineProps<{
  realtimeData: Record<string, unknown>
}>()

defineEmits<{
  refresh: []
}>()

const formatTime = (timestamp: unknown) => {
  if (!timestamp) return '--'
  const date = new Date(timestamp as string)
  return date.toLocaleTimeString()
}

const hourlyChartOption = computed(() => {
  const hourlyTrend = (props.realtimeData.hourlyTrend as Record<string, unknown>[]) || []
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['上传数', '检测数'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: hourlyTrend.map((h) => `${h.hour}:00`),
      axisLabel: { interval: 1 },
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '上传数',
        type: 'bar',
        data: hourlyTrend.map((h) => h.uploads),
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '检测数',
        type: 'bar',
        data: hourlyTrend.map((h) => h.detections),
        itemStyle: { color: '#52c41a' },
      },
    ],
  }
})
</script>

<style scoped>
.realtime-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h3 {
  margin: 0;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.realtime-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.realtime-card {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-data {
  display: flex;
  flex-direction: column;
}

.card-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.card-value.danger {
  color: #ff4d4f;
}

.card-label {
  font-size: 0.85rem;
  color: #666;
}

.storage-increase {
  background: #e6f7ff;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.storage-increase strong {
  color: #1890ff;
  font-size: 1.2rem;
}

.hourly-trend {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.hourly-trend h3 {
  margin: 0 0 15px 0;
}

.chart {
  height: 300px;
  width: 100%;
}
</style>
