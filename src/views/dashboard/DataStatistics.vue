<template>
  <div class="page-container" v-loading="loading">
    <div class="header-section">
      <div class="title-with-refresh">
        <h2>数据统计仪表盘</h2>
        <el-button 
          type="primary" 
          :icon="RefreshRight" 
          circle 
          size="small"
          @click="refreshAllData"
          :loading="refreshing"
          title="刷新数据"
        />
      </div>
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

    <!-- 数据分析 Tab 切换 -->
    <el-tabs v-model="activeTab" class="main-tabs" @tab-change="handleTabChange">
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
        <PersonalStats :personal-data="personalData" :raw-data="rawData" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { RefreshRight } from '@element-plus/icons-vue'
import * as StatsApi from '@/api/statistics_api'
import ImageStats from './components/ImageStats.vue'
import VideoStats from './components/VideoStats.vue'
import StorageStats from './components/StorageStats.vue'
import TimeAnalysis from './components/TimeAnalysis.vue'
import RealtimeDashboard from './components/RealtimeDashboard.vue'
import PersonalStats from './components/PersonalStats.vue'

// 简化判断：您可以根据实际项目逻辑替换这里的 isAdmin 判断
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
const refreshing = ref(false)
const dateRange = ref<[string, string] | null>(null)
const activeTab = ref('image')

// 图片统计数据状态
const overviewData = ref({
  totalImages: 0,
  totalAnomalyImages: 0,
  anomalyRate: 0,
  dailyTrend: [] as Record<string, unknown>[],
  topAnomalyType: [] as Record<string, unknown>[],
})
const adminData = ref<Record<string, unknown>>({})
const confDistribution = ref<Record<string, unknown>[]>([])

// 视频统计数据状态
const videoOverview = ref<Record<string, unknown>>({})

// 存储分析数据状态
const storageData = ref<Record<string, unknown>>({})
const fileTypes = ref<Record<string, unknown>>({})

// 时段分析数据状态
const timeAnalysis = ref<Record<string, unknown>>({})

// 实时监控数据状态（管理员）
const realtimeData = ref<Record<string, unknown>>({})

// 个人统计数据状态
const personalData = ref<Record<string, unknown>>({})

const rawData = ref<{
  recentImageDetections: Record<string, unknown>[]
  recentVideoDetections: Record<string, unknown>[]
}>({
  recentImageDetections: [],
  recentVideoDetections: []
})

// 加载图片统计数据
const loadImageData = async () => {
  try {
    const startDate = dateRange.value?.[0]
    const endDate = dateRange.value?.[1]

    // 1. 获取图片概览
    const overviewRes = await StatsApi.getImageOverview()
    if (overviewRes.ok && overviewRes.data) {
      overviewData.value = overviewRes.data
    }

    // 2. 获取异常分布和置信度分布
    const distRes = await StatsApi.getAnomalyTypeDistribution({ startDate, endDate })
    if (distRes.ok && distRes.data) {
      confDistribution.value = distRes.data.confidenceDistribution || []
    }

    // 3. 如果是管理员，获取全局汇总
    if (isAdmin.value) {
      const adminRes = await StatsApi.getAdminTotalOverview({ startDate, endDate })
      if (adminRes.ok && adminRes.data) {
        adminData.value = adminRes.data
      }
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取图片统计数据失败')
  }
}

// 加载视频数据
const loadVideoData = async () => {
  try {
    const res = await StatsApi.getVideoOverview()
    if (res.ok && res.data) {
      videoOverview.value = res.data
    }
  } catch (error) {
    console.error('Failed to load video data:', error)
  }
}

// 加载存储数据
const loadStorageData = async () => {
  try {
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
  } catch (error) {
    console.error('Failed to load storage data:', error)
  }
}

// 加载时段分析
const loadTimeAnalysis = async () => {
  try {
    const res = await StatsApi.getAnomalyTimeAnalysis()
    if (res.ok && res.data) {
      timeAnalysis.value = res.data
    }
  } catch (error) {
    console.error('Failed to load time analysis:', error)
  }
}

// 加载实时数据（管理员）
const loadRealtimeData = async () => {
  if (!isAdmin.value) return
  try {
    const res = await StatsApi.getRealtimeDashboard()
    if (res.ok && res.data) {
      realtimeData.value = res.data
    }
  } catch (error) {
    console.error('Failed to load realtime data:', error)
  }
}

// 加载个人数据
const loadPersonalData = async () => {
  try {
    const res = await StatsApi.getPersonalStats()
    console.log('Personal stats response:', res)
    if (res.ok && res.data) {
      personalData.value = res.data
      console.log('Personal data loaded:', personalData.value)
    } else {
      console.warn('Personal stats response not ok or no data:', res)
    }
  } catch (error) {
    console.error('Failed to load personal data:', error)
  }
}

// 根据 Tab 加载数据
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

// 加载数据
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

// 刷新所有数据
const refreshAllData = async () => {
  refreshing.value = true
  try {
    // 根据当前 Tab 刷新对应数据
    await handleTabChange(activeTab.value)
    ElMessage.success('数据已刷新')
  } catch (error) {
    console.error(error)
    ElMessage.error('刷新数据失败')
  } finally {
    refreshing.value = false
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

.title-with-refresh {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-with-refresh h2 {
  margin: 0;
}

.header-section h2 {
  margin: 0;
}

.main-tabs {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
