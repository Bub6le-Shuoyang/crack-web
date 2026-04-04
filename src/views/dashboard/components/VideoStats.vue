<template>
  <div class="video-stats">
    <!-- 视频概览卡片 -->
    <div class="overview-cards">
      <div class="stat-card">
        <el-icon :size="32" color="#722ed1"><VideoCamera /></el-icon>
        <div class="card-content">
          <h4>视频总数</h4>
          <p class="number">{{ videoOverview.totalVideos || 0 }}</p>
        </div>
      </div>
      <div class="stat-card">
        <el-icon :size="32" color="#52c41a"><Timer /></el-icon>
        <div class="card-content">
          <h4>总时长</h4>
          <p class="number">{{ videoOverview.totalDurationFormatted || '0:00' }}</p>
        </div>
      </div>
      <div class="stat-card">
        <el-icon :size="32" color="#1890ff"><Search /></el-icon>
        <div class="card-content">
          <h4>已检测视频</h4>
          <p class="number">{{ videoOverview.detectedVideos || 0 }}</p>
        </div>
      </div>
      <div class="stat-card">
        <el-icon :size="32" color="#ff4d4f"><WarningFilled /></el-icon>
        <div class="card-content">
          <h4>异常视频数</h4>
          <p class="number danger">{{ videoOverview.anomalyVideos || 0 }}</p>
          <span class="sub-text"
            >异常率: {{ ((videoOverview.anomalyVideoRate as number) * 100 || 0).toFixed(1) }}%</span
          >
        </div>
      </div>
    </div>

    <div class="charts-container">
      <!-- 异常类型分布 -->
      <div class="chart-card">
        <h3>视频异常类型分布</h3>
        <v-chart class="chart" :option="pieChartOption" autoresize />
      </div>

      <!-- 近7天检测趋势 -->
      <div class="chart-card wide">
        <h3>近7天视频检测趋势</h3>
        <v-chart class="chart" :option="trendChartOption" autoresize />
      </div>
    </div>

    <!-- 检测效率分析 -->
    <div class="efficiency-section" v-if="videoOverview.avgAnomalyTimeRatio !== undefined">
      <h3>检测效率分析</h3>
      <div class="efficiency-metrics">
        <div class="metric-item">
          <span class="metric-label">平均异常时间占比</span>
          <span class="metric-value"
            >{{ ((videoOverview.avgAnomalyTimeRatio as number) * 100 || 0).toFixed(2) }}%</span
          >
          <span class="metric-desc">平均每个视频中异常帧占总帧数的比例</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">检测覆盖率</span>
          <span class="metric-value"> {{ getDetectionRate() }}% </span>
          <span class="metric-desc">已检测视频占总视频的比例</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { VideoCamera, Timer, Search, WarningFilled } from '@element-plus/icons-vue'

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

const props = defineProps<{
  videoOverview: Record<string, unknown>
  isAdmin: boolean
}>()

const getDetectionRate = () => {
  const total = (props.videoOverview.totalVideos as number) || 0
  const detected = (props.videoOverview.detectedVideos as number) || 0
  if (total === 0) return '0.0'
  return ((detected / total) * 100).toFixed(1)
}

// 饼图配置
const pieChartOption = computed(() => {
  const getMappedLabel = (label: string) => {
    const map: Record<string, string> = {
      P0: '纵向裂缝',
      P1: '横向裂缝',
      P2: '龟裂',
      P3: '坑洞',
      P4: '坑洞',
      p0: '纵向裂缝',
      p1: '横向裂缝',
      p2: '龟裂',
      p3: '坑洞',
      p4: '坑洞',
    }
    return map[label] || label
  }

  const types = (props.videoOverview.topAnomalyTypes as Record<string, unknown>[]) || []
  if (types.length === 0) {
    return { title: { text: '暂无异常数据', left: 'center', top: 'center' }, series: [] }
  }
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { top: '10%', right: '5%' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        data: types.map((t) => ({
          value: t.count,
          name: getMappedLabel(t.label as string),
        })),
      },
    ],
  }
})

// 趋势图配置
const trendChartOption = computed(() => {
  const trend = (props.videoOverview.dailyTrend as Record<string, unknown>[]) || []
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['检测视频数', '异常视频数'], top: '5%', right: '5%' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trend.map((d) => d.date),
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '检测视频数',
        type: 'line',
        smooth: true,
        data: trend.map((d) => d.total),
        itemStyle: { color: '#1890ff' },
        areaStyle: { opacity: 0.3 },
      },
      {
        name: '异常视频数',
        type: 'line',
        smooth: true,
        data: trend.map((d) => d.anomaly),
        itemStyle: { color: '#ff4d4f' },
        areaStyle: { opacity: 0.3 },
      },
    ],
  }
})
</script>

<style scoped>
.video-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-content h4 {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 0.9rem;
}

.card-content .number {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

.card-content .number.danger {
  color: #ff4d4f;
}

.sub-text {
  font-size: 0.85rem;
  color: #999;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.chart-card.wide {
  grid-column: 1 / -1;
}

.chart-card h3 {
  margin: 0 0 15px 0;
  font-size: 1rem;
}

.chart {
  height: 300px;
  width: 100%;
}

.efficiency-section {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.efficiency-section h3 {
  margin: 0 0 15px 0;
}

.efficiency-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-label {
  font-size: 0.9rem;
  color: #666;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  color: #1890ff;
}

.metric-desc {
  font-size: 0.85rem;
  color: #999;
}
</style>
