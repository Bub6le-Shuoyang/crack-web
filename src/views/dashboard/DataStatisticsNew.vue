<template>
  <div class="page-container" v-loading="loading">
    <div class="header-section">
      <h2>数据统计仪表盘</h2>
      <div class="filter-section" v-if="isAdmin">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="loadData"
        />
      </div>
    </div>

    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" class="stats-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="图片统计" name="image">
        <ImageStats
          :overview-data="overviewData"
          :conf-distribution="confDistribution"
          :admin-data="adminData"
          :is-admin="isAdmin"
        />
      </el-tab-pane>
      <el-tab-pane label="视频统计" name="video">
        <VideoStats :video-overview="videoOverview" :is-admin="isAdmin" />
      </el-tab-pane>
      <el-tab-pane label="存储分析" name="storage">
        <StorageStats :storage-data="storageData" :file-types="fileTypes" :is-admin="isAdmin" />
      </el-tab-pane>
      <el-tab-pane label="时段分析" name="time">
        <TimeAnalysis :time-analysis="timeAnalysis" />
      </el-tab-pane>
      <el-tab-pane v-if="isAdmin" label="实时监控" name="realtime">
        <RealtimeDashboard :realtime-data="realtimeData" @refresh="loadRealtimeData" />
      </el-tab-pane>
      <el-tab-pane label="个人统计" name="personal">
        <PersonalStats :personal-data="personalData" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import * as StatsApi from '@/api/statistics_api'
import ImageStats from './components/ImageStats.vue'
import VideoStats from './components/VideoStats.vue'
import StorageStats from './components/StorageStats.vue'
import TimeAnalysis from './components/TimeAnalysis.vue'
import RealtimeDashboard from './components/RealtimeDashboard.vue'
import PersonalStats from './components/PersonalStats.vue'

const isAdmin = computed(() => {
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo)
      return user.roleId === 'admin'
    } catch {
      return false
    }
  }
  return false
})

const loading = ref(false)
const dateRange = ref<[string, string] | null>(null)
const activeTab = ref('image')

// 数据状态
const overviewData = ref({
  totalImages: 0,
  totalAnomalyImages: 0,
  anomalyRate: 0,
  dailyTrend: [] as Record<string, unknown>[],
  topAnomalyType: [] as Record<string, unknown>[],
})

const adminData = ref<Record<string, unknown>>({})
const confDistribution = ref<Record<string, unknown>[]>([])
const videoOverview = ref<Record<string, unknown>>({})
const storageData = ref<Record<string, unknown>>({})
const fileTypes = ref<Record<string, unknown>>({})
const timeAnalysis = ref<Record<string, unknown>>({})
const realtimeData = ref<Record<string, unknown>>({})
const personalData = ref<Record<string, unknown>>({})

// 加载图片相关数据
const loadImageData = async () => {
  const startDate = dateRange.value?.[0]
  const endDate = dateRange.value?.[1]

  const overviewRes = await StatsApi.getImageOverview()
  if (overviewRes.ok && overviewRes.data) {
    overviewData.value = overviewRes.data
  }

  const distRes = await StatsApi.getAnomalyTypeDistribution({ startDate, endDate })
  if (distRes.ok && distRes.data) {
    confDistribution.value = distRes.data.confidenceDistribution || []
  }

  if (isAdmin.value) {
    const adminRes = await StatsApi.getAdminTotalOverview({ startDate, endDate })
    if (adminRes.ok && adminRes.data) {
      adminData.value = adminRes.data
    }
  }
}

// 加载视频数据
const loadVideoData = async () => {
  const res = await StatsApi.getVideoOverview()
  if (res.ok && res.data) {
    videoOverview.value = res.data
  }
}

// 加载存储数据
const loadStorageData = async () => {
  const [storageRes, fileTypesRes] = await Promise.all([
    StatsApi.getStorageStats(),
    StatsApi.getFileTypeDistribution(),
  ])
  if (storageRes.ok && storageRes.data) {
    storageData.value = storageRes.data
  }
  if (fileTypesRes.ok && fileTypesRes.data) {
    fileTypes.value = fileTypesRes.data
  }
}

// 加载时段分析
const loadTimeAnalysis = async () => {
  const res = await StatsApi.getAnomalyTimeAnalysis()
  if (res.ok && res.data) {
    timeAnalysis.value = res.data
  }
}

// 加载实时数据（管理员）
const loadRealtimeData = async () => {
  if (!isAdmin.value) return
  const res = await StatsApi.getRealtimeDashboard()
  if (res.ok && res.data) {
    realtimeData.value = res.data
  }
}

// 加载个人数据
const loadPersonalData = async () => {
  const res = await StatsApi.getPersonalStats()
  if (res.ok && res.data) {
    personalData.value = res.data
  }
}

// 根据Tab加载数据
const handleTabChange = async (tab: string) => {
  switch (tab) {
    case 'image':
      await loadImageData()
      break
    case 'video':
      await loadVideoData()
      break
    case 'storage':
      await loadStorageData()
      break
    case 'time':
      await loadTimeAnalysis()
      break
    case 'realtime':
      await loadRealtimeData()
      break
    case 'personal':
      await loadPersonalData()
      break
  }
}

// 主加载函数
const loadData = async () => {
  loading.value = true
  try {
    await loadImageData()
  } catch (error) {
    console.error(error)
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  background: transparent;
  min-height: 100%;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-section h2 {
  margin: 0;
}

.stats-tabs {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
