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

    <!-- 概览数据卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <h3>{{ isAdmin ? '平台图片检测总数' : '我的图片检测数' }}</h3>
        <p class="number">{{ overviewData.totalImages }}</p>
      </div>
      <div class="stat-card">
        <h3>异常图片数</h3>
        <p class="number danger">{{ overviewData.totalAnomalyImages }}</p>
      </div>
      <div class="stat-card">
        <h3>图片异常率</h3>
        <p class="number">{{ (overviewData.anomalyRate * 100).toFixed(1) }}%</p>
      </div>
      <div class="stat-card" v-if="isAdmin">
        <h3>总活跃用户</h3>
        <p class="number info">{{ adminData.totalUsers || 0 }}</p>
      </div>
      <div class="stat-card" v-if="isAdmin">
        <h3>视频异常数</h3>
        <p class="number danger">{{ adminData.totalAnomalyVideos || 0 }}</p>
      </div>
    </div>

    <div class="charts-container">
      <!-- 每日检测趋势折线图 -->
      <div class="chart-card wide-card">
        <h3>近7天检测趋势</h3>
        <v-chart class="chart" :option="trendChartOption" autoresize />
      </div>

      <!-- 异常类型分布饼图 -->
      <div class="chart-card">
        <h3>图片异常类型分布</h3>
        <v-chart class="chart" :option="pieChartOption" autoresize />
      </div>

      <!-- 置信度分布柱状图 -->
      <div class="chart-card">
        <h3>检测置信度分布</h3>
        <v-chart class="chart" :option="barChartOption" autoresize />
      </div>
    </div>

    <!-- 管理员专属排行榜 -->
    <div class="charts-container" v-if="isAdmin && adminData.userAnomalyRank">
      <div class="chart-card wide-card">
        <h3>用户异常检测量排行 (Top 10)</h3>
        <el-table :data="adminData.userAnomalyRank" stripe style="width: 100%" size="small">
          <el-table-column type="index" label="排名" width="80" align="center" />
          <el-table-column prop="userName" label="用户名" />
          <el-table-column prop="anomalyCount" label="异常发现数" align="right">
            <template #default="scope">
              <el-tag type="danger">{{ scope.row.anomalyCount }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { ElMessage } from 'element-plus'
import * as StatsApi from '@/api/statistics_api'
// 移除不存在的 auth 导入，改为从 localStorage 获取 token 角色或简化处理
// import { useAuthStore } from '@/api/auth'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

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
const dateRange = ref<[string, string] | null>(null)

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

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const startDate = dateRange.value?.[0]
    const endDate = dateRange.value?.[1]

    // 1. 获取基础概览
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
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

// --- ECharts 配置项 ---

const trendChartOption = computed(() => {
  const dates = overviewData.value.dailyTrend.map((d) => d.date)
  const totals = overviewData.value.dailyTrend.map((d) => d.total)
  const anomalies = overviewData.value.dailyTrend.map((d) => d.anomaly)

  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['检测总数', '异常数'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: dates },
    yAxis: { type: 'value' },
    series: [
      {
        name: '检测总数',
        type: 'line',
        data: totals,
        smooth: true,
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '异常数',
        type: 'line',
        data: anomalies,
        smooth: true,
        itemStyle: { color: '#ff4d4f' },
      },
    ],
  }
})

const pieChartOption = computed(() => {
  const data = overviewData.value.topAnomalyType.map((t) => ({
    name: t.label,
    value: t.count,
  }))

  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '异常类型',
        type: 'pie',
        radius: '50%',
        data: data.length ? data : [{ name: '暂无数据', value: 0 }],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }
})

const barChartOption = computed(() => {
  const ranges = confDistribution.value.map((c) => c.range)
  const counts = confDistribution.value.map((c) => c.count)

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ranges },
    yAxis: { type: 'value' },
    series: [
      {
        name: '数量',
        type: 'bar',
        barWidth: '50%',
        data: counts,
        itemStyle: { color: '#52c41a' },
      },
    ],
  }
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-card h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 0.9rem;
}

.number {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.number.danger {
  color: #ff4d4f;
}

.number.info {
  color: #1890ff;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.wide-card {
  grid-column: 1 / -1;
}

.chart-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-card h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.1rem;
}

.chart {
  height: 300px;
  width: 100%;
}
</style>
