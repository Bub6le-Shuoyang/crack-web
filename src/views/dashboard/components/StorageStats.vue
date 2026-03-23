<template>
  <div class="storage-stats">
    <!-- 存储概览卡片 -->
    <div class="overview-cards">
      <div class="stat-card">
        <el-icon :size="32" color="#1890ff"><FolderOpened /></el-icon>
        <div class="card-content">
          <h4>总存储空间</h4>
          <p class="number">{{ storageData.totalStorageFormatted || '0 B' }}</p>
        </div>
      </div>
      <div class="stat-card">
        <el-icon :size="32" color="#52c41a"><Picture /></el-icon>
        <div class="card-content">
          <h4>图片存储</h4>
          <p class="number">{{ storageData.imageStorageFormatted || '0 B' }}</p>
          <span class="sub-text">共 {{ storageData.imageCount || 0 }} 张</span>
        </div>
      </div>
      <div class="stat-card">
        <el-icon :size="32" color="#722ed1"><VideoCamera /></el-icon>
        <div class="card-content">
          <h4>视频存储</h4>
          <p class="number">{{ storageData.videoStorageFormatted || '0 B' }}</p>
          <span class="sub-text">共 {{ storageData.videoCount || 0 }} 个</span>
        </div>
      </div>
    </div>

    <div class="charts-row">
      <!-- 存储占比饼图 -->
      <div class="chart-card">
        <h3>存储空间占比</h3>
        <v-chart class="chart" :option="pieChartOption" autoresize />
      </div>

      <!-- 存储增长趋势 -->
      <div class="chart-card wide">
        <h3>近30天存储增长趋势</h3>
        <v-chart class="chart" :option="trendChartOption" autoresize />
      </div>
    </div>

    <!-- 文件类型分布 -->
    <div class="charts-row">
      <div class="chart-card">
        <h3>图片格式分布</h3>
        <v-chart class="chart" :option="imageTypePieOption" autoresize />
      </div>
      <div class="chart-card">
        <h3>视频格式分布</h3>
        <v-chart class="chart" :option="videoTypePieOption" autoresize />
      </div>
    </div>

    <!-- 管理员：用户存储排名 -->
    <div v-if="isAdmin && storageData.storageByUser?.length" class="rank-section">
      <h3>用户存储占用排行 (Top 10)</h3>
      <el-table :data="storageData.storageByUser" stripe size="small">
        <el-table-column type="index" label="排名" width="80" align="center" />
        <el-table-column prop="userName" label="用户名" />
        <el-table-column prop="storageFormatted" label="存储占用" align="right">
          <template #default="scope">
            <el-tag type="info">{{ scope.row.storageFormatted }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="percentage" label="占比" align="right">
          <template #default="scope">
            <el-progress
              :percentage="scope.row.percentage"
              :stroke-width="10"
              :show-text="false"
            />
            <span class="percent-text">{{ scope.row.percentage.toFixed(1) }}%</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { FolderOpened, Picture, VideoCamera } from '@element-plus/icons-vue'

use([CanvasRenderer, PieChart, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

const props = defineProps<{
  storageData: Record<string, unknown>
  fileTypes: Record<string, unknown>
  isAdmin: boolean
}>()

// 存储占比饼图
const pieChartOption = computed(() => {
  const total = (props.storageData.totalStorage as number) || 0
  if (total === 0) {
    return {
      title: { text: '暂无数据', left: 'center', top: 'center' },
      series: [],
    }
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
        data: [
          {
            value: props.storageData.imageStorage || 0,
            name: '图片',
            itemStyle: { color: '#52c41a' },
          },
          {
            value: props.storageData.videoStorage || 0,
            name: '视频',
            itemStyle: { color: '#722ed1' },
          },
        ],
      },
    ],
  }
})

// 存储趋势图
const trendChartOption = computed(() => {
  const trend = (props.storageData.storageTrend as Record<string, unknown>[]) || []
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: trend.map((d) => d.date),
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1024 * 1024 * 1024) return (value / (1024 * 1024 * 1024)).toFixed(1) + 'GB'
          if (value >= 1024 * 1024) return (value / (1024 * 1024)).toFixed(1) + 'MB'
          if (value >= 1024) return (value / 1024).toFixed(1) + 'KB'
          return value + 'B'
        },
      },
    },
    series: [
      {
        name: '累计存储',
        type: 'line',
        smooth: true,
        data: trend.map((d) => d.total),
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#1890ff' },
      },
    ],
  }
})

// 图片格式分布
const imageTypePieOption = computed(() => {
  const types = (props.fileTypes.imageTypes as Record<string, unknown>[]) || []
  if (types.length === 0) {
    return { title: { text: '暂无数据', left: 'center', top: 'center' }, series: [] }
  }
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { top: '10%', right: '5%' },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data: types.map((t) => ({ value: t.count, name: t.type })),
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
      },
    ],
  }
})

// 视频格式分布
const videoTypePieOption = computed(() => {
  const types = (props.fileTypes.videoTypes as Record<string, unknown>[]) || []
  if (types.length === 0) {
    return { title: { text: '暂无数据', left: 'center', top: 'center' }, series: [] }
  }
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { top: '10%', right: '5%' },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data: types.map((t) => ({ value: t.count, name: t.type })),
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
      },
    ],
  }
})
</script>

<style scoped>
.storage-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
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
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.sub-text {
  font-size: 0.85rem;
  color: #999;
}

.charts-row {
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
  color: #333;
}

.chart {
  height: 300px;
  width: 100%;
}

.rank-section {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.rank-section h3 {
  margin: 0 0 15px 0;
}

.percent-text {
  font-size: 0.85rem;
  color: #666;
  margin-left: 8px;
}
</style>
