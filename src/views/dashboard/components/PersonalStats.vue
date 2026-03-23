<template>
  <div class="personal-stats">
    <h3>我的数据统计</h3>

    <!-- 核心指标卡片 -->
    <div class="metric-cards">
      <div class="metric-card">
        <el-icon :size="28" color="#1890ff"><Picture /></el-icon>
        <div class="metric-info">
          <span class="metric-value">{{ personalData.totalImages || 0 }}</span>
          <span class="metric-label">图片总数</span>
        </div>
      </div>
      <div class="metric-card">
        <el-icon :size="28" color="#722ed1"><VideoCamera /></el-icon>
        <div class="metric-info">
          <span class="metric-value">{{ personalData.totalVideos || 0 }}</span>
          <span class="metric-label">视频总数</span>
        </div>
      </div>
      <div class="metric-card">
        <el-icon :size="28" color="#52c41a"><FolderOpened /></el-icon>
        <div class="metric-info">
          <span class="metric-value">{{ personalData.totalStorageFormatted || '0 B' }}</span>
          <span class="metric-label">存储占用</span>
        </div>
      </div>
      <div class="metric-card">
        <el-icon :size="28" color="#13c2c2"><Search /></el-icon>
        <div class="metric-info">
          <span class="metric-value">{{ personalData.totalDetections || 0 }}</span>
          <span class="metric-label">检测次数</span>
        </div>
      </div>
      <div class="metric-card danger">
        <el-icon :size="28" color="#ff4d4f"><WarningFilled /></el-icon>
        <div class="metric-info">
          <span class="metric-value">{{ personalData.anomalyCount || 0 }}</span>
          <span class="metric-label">异常发现</span>
        </div>
      </div>
      <div class="metric-card">
        <el-icon :size="28" color="#faad14"><TrendCharts /></el-icon>
        <div class="metric-info">
          <span class="metric-value">{{ ((personalData.anomalyRate as number) * 100 || 0).toFixed(1) }}%</span>
          <span class="metric-label">异常率</span>
        </div>
      </div>
    </div>

    <!-- 检测详情 -->
    <div class="detail-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="detail-card">
            <h4>图片检测统计</h4>
            <div class="detail-item">
              <span>已检测图片</span>
              <el-tag type="success">{{ personalData.detectedImages || 0 }} 张</el-tag>
            </div>
            <div class="detail-item">
              <span>异常图片</span>
              <el-tag type="danger">{{ personalData.anomalyImages || 0 }} 张</el-tag>
            </div>
            <el-progress
              :percentage="getPercentage(personalData.detectedImages, personalData.totalImages)"
              :stroke-width="8"
              status="success"
            >
              <span>检测覆盖率</span>
            </el-progress>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="detail-card">
            <h4>视频检测统计</h4>
            <div class="detail-item">
              <span>已检测视频</span>
              <el-tag type="success">{{ personalData.detectedVideos || 0 }} 个</el-tag>
            </div>
            <div class="detail-item">
              <span>异常视频</span>
              <el-tag type="danger">{{ personalData.anomalyVideos || 0 }} 个</el-tag>
            </div>
            <el-progress
              :percentage="getPercentage(personalData.detectedVideos, personalData.totalVideos)"
              :stroke-width="8"
              status="success"
            >
              <span>检测覆盖率</span>
            </el-progress>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 近7天活动趋势 -->
    <div class="activity-section" v-if="personalData.recentActivity?.length">
      <h4>近7天活动趋势</h4>
      <v-chart class="chart" :option="activityChartOption" autoresize />
    </div>

    <!-- 原始数据表格 -->
    <div class="raw-data-section" v-loading="rawDataLoading">
      <h4>原始数据</h4>
      
      <!-- 最近图片检测记录 -->
      <div class="raw-data-table">
        <h5>最近图片检测记录 (最近10条)</h5>
        <el-table :data="rawData.recentImageDetections || []" stripe style="width: 100%" size="small">
          <el-table-column prop="fileName" label="文件名" min-width="150" show-overflow-tooltip />
          <el-table-column prop="uploaderName" label="上传者" width="100" />
          <el-table-column prop="fileSizeFormatted" label="大小" width="80" />
          <el-table-column label="检测状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.isDetected ? 'success' : 'info'" size="small">
                {{ row.isDetected ? '已检测' : '未检测' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="异常情况" width="120">
            <template #default="{ row }">
              <template v-if="row.isDetected">
                <el-tag :type="row.anomalyCount > 0 ? 'danger' : 'success'" size="small">
                  {{ row.anomalyCount > 0 ? `异常 ${row.anomalyCount}` : '正常' }}
                </el-tag>
              </template>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="最高置信度异常" width="140">
            <template #default="{ row }">
              <template v-if="row.isDetected && row.topAnomalyLabel">
                <span>{{ row.topAnomalyLabel }}</span>
                <span v-if="row.topAnomalyScore" class="score-text">
                  ({{ (row.topAnomalyScore * 100).toFixed(1) }}%)
                </span>
              </template>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="上传时间" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 最近视频检测记录 -->
      <div class="raw-data-table">
        <h5>最近视频检测记录 (最近3条)</h5>
        <el-table :data="rawData.recentVideoDetections || []" stripe style="width: 100%" size="small">
          <el-table-column prop="fileName" label="文件名" min-width="150" show-overflow-tooltip />
          <el-table-column prop="uploaderName" label="上传者" width="100" />
          <el-table-column prop="fileSizeFormatted" label="大小" width="80" />
          <el-table-column label="检测状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.isDetected ? 'success' : 'info'" size="small">
                {{ row.isDetected ? '已检测' : '未检测' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="异常情况" width="130">
            <template #default="{ row }">
              <template v-if="row.isDetected">
                <el-tag :type="row.anomalyCount > 0 ? 'danger' : 'success'" size="small">
                  {{ row.anomalyCount > 0 ? `异常 ${row.anomalyCount} 帧` : '正常' }}
                </el-tag>
                <span v-if="row.anomalyRate > 0" class="rate-text">
                  ({{ (row.anomalyRate * 100).toFixed(1) }}%)
                </span>
              </template>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="上传时间" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { Picture, VideoCamera, FolderOpened, Search, WarningFilled, TrendCharts } from '@element-plus/icons-vue'
import * as StatsApi from '@/api/statistics_api'

use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent])

const props = defineProps<{
  personalData: Record<string, unknown>
}>()

const rawDataLoading = ref(false)
const rawData = ref<{
  recentImageDetections: Record<string, unknown>[]
  recentVideoDetections: Record<string, unknown>[]
}>({
  recentImageDetections: [],
  recentVideoDetections: []
})

const getPercentage = (detected: unknown, total: unknown) => {
  const d = (detected as number) || 0
  const t = (total as number) || 0
  if (t === 0) return 0
  return Math.round((d / t) * 100)
}

const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

const loadRawData = async () => {
  rawDataLoading.value = true
  try {
    const res = await StatsApi.getRawDetectionData()
    if (res.ok && res.data) {
      rawData.value = res.data as typeof rawData.value
    }
  } catch (error) {
    console.error('Failed to load raw detection data:', error)
  } finally {
    rawDataLoading.value = false
  }
}

const activityChartOption = computed(() => {
  const activity = (props.personalData.recentActivity as Record<string, unknown>[]) || []
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['上传数', '检测数'], top: '5%', right: '5%' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: { type: 'category', data: activity.map((d) => d.date) },
    yAxis: { type: 'value' },
    series: [
      {
        name: '上传数',
        type: 'bar',
        data: activity.map((d) => d.uploads),
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '检测数',
        type: 'line',
        data: activity.map((d) => d.detections),
        itemStyle: { color: '#52c41a' },
        smooth: true,
      },
    ],
  }
})

// 监听 personalData 变化，加载原始数据
watch(() => props.personalData, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    loadRawData()
  }
}, { immediate: true, deep: true })
</script>

<style scoped>
.personal-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.personal-stats h3 {
  margin: 0;
  color: #333;
}

.metric-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 3px solid #1890ff;
}

.metric-card.danger {
  border-left-color: #ff4d4f;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.metric-label {
  font-size: 0.85rem;
  color: #999;
}

.detail-section {
  margin-top: 10px;
}

.detail-card {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
  height: 100%;
}

.detail-card h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.activity-section {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.activity-section h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.chart {
  height: 250px;
  width: 100%;
}

/* 原始数据样式 */
.raw-data-section {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.raw-data-section h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.raw-data-table {
  margin-bottom: 20px;
}

.raw-data-table:last-child {
  margin-bottom: 0;
}

.raw-data-table h5 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.score-text {
  color: #999;
  font-size: 12px;
  margin-left: 4px;
}

.rate-text {
  color: #999;
  font-size: 12px;
  margin-left: 4px;
}
</style>
