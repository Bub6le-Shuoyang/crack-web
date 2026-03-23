<template>
  <div class="time-analysis">
    <!-- 峰值信息卡片 -->
    <div class="peak-card" v-if="timeAnalysis.peakAnomalyHour !== undefined">
      <el-icon :size="24" color="#ff4d4f"><WarningFilled /></el-icon>
      <div class="peak-info">
        <h4>异常高发时段</h4>
        <p>
          <span class="highlight">{{ timeAnalysis.peakAnomalyHourLabel }}</span>
          异常率最高，达到
          <span class="highlight danger">{{ ((timeAnalysis.peakAnomalyRate as number) * 100).toFixed(1) }}%</span>
        </p>
      </div>
    </div>

    <div class="charts-row">
      <!-- 24小时分布热力图 -->
      <div class="chart-card">
        <h3>24小时上传与异常分布</h3>
        <v-chart class="chart" :option="hourlyChartOption" autoresize />
      </div>

      <!-- 星期分布 -->
      <div class="chart-card">
        <h3>星期维度异常分析</h3>
        <v-chart class="chart" :option="weekdayChartOption" autoresize />
      </div>
    </div>

    <!-- 异常率热力条 -->
    <div class="heatmap-section">
      <h3>24小时异常率热力图</h3>
      <div class="heatmap-bar">
        <div
          v-for="(item, index) in hourlyDistribution"
          :key="index"
          class="heatmap-cell"
          :style="{
            backgroundColor: getHeatmapColor((item.anomalyRate as number) || 0),
          }"
          :title="`${item.hourLabel}: 异常率 ${((item.anomalyRate as number) * 100 || 0).toFixed(1)}%`"
        >
          <span class="hour-label">{{ item.hour }}</span>
        </div>
      </div>
      <div class="heatmap-legend">
        <span>低</span>
        <div class="legend-gradient"></div>
        <span>高</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { WarningFilled } from '@element-plus/icons-vue'

use([CanvasRenderer, BarChart, TitleComponent, TooltipComponent, GridComponent])

const props = defineProps<{
  timeAnalysis: Record<string, unknown>
}>()

const hourlyDistribution = computed(() => {
  return (props.timeAnalysis.hourlyDistribution as Record<string, unknown>[]) || []
})

const weekdayDistribution = computed(() => {
  return (props.timeAnalysis.weekdayDistribution as Record<string, unknown>[]) || []
})

// 获取热力图颜色
const getHeatmapColor = (rate: number) => {
  // 从绿色渐变到红色
  const r = Math.floor(rate * 255)
  const g = Math.floor((1 - rate) * 200)
  return `rgb(${r}, ${g}, 50)`
}

// 小时分布柱状图
const hourlyChartOption = computed(() => {
  const data = hourlyDistribution.value
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: Record<string, unknown>[]) => {
        const p = params[0] as Record<string, unknown>
        const item = data.find((d) => d.hour === p.dataIndex)
        return `
          <div>
            <strong>${item?.hourLabel || ''}</strong><br/>
            上传数: ${item?.uploads || 0}<br/>
            异常数: ${item?.anomalies || 0}<br/>
            异常率: ${(((item?.anomalyRate as number) || 0) * 100).toFixed(1)}%
          </div>
        `
      },
    },
    legend: { data: ['上传数', '异常数'], top: '5%', right: '5%' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.hourLabel?.toString().split('-')[0]),
      axisLabel: { interval: 2 },
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '上传数',
        type: 'bar',
        data: data.map((d) => d.uploads),
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '异常数',
        type: 'bar',
        data: data.map((d) => d.anomalies),
        itemStyle: { color: '#ff4d4f' },
      },
    ],
  }
})

// 星期分布柱状图
const weekdayChartOption = computed(() => {
  const data = weekdayDistribution.value
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: Record<string, unknown>[]) => {
        const p = params[0] as Record<string, unknown>
        const item = data.find((d) => d.weekdayName === p.name)
        return `
          <div>
            <strong>${item?.weekdayName || ''}</strong><br/>
            上传数: ${item?.uploads || 0}<br/>
            异常数: ${item?.anomalies || 0}<br/>
            异常率: ${(((item?.anomalyRate as number) || 0) * 100).toFixed(1)}%
          </div>
        `
      },
    },
    legend: { data: ['上传数', '异常率'], top: '5%', right: '5%' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.weekdayName),
    },
    yAxis: [
      { type: 'value', name: '数量' },
      { type: 'value', name: '异常率', max: 1, axisLabel: { formatter: '{value}' } },
    ],
    series: [
      {
        name: '上传数',
        type: 'bar',
        data: data.map((d) => d.uploads),
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '异常率',
        type: 'line',
        yAxisIndex: 1,
        data: data.map((d) => d.anomalyRate),
        itemStyle: { color: '#ff4d4f' },
        smooth: true,
      },
    ],
  }
})
</script>

<style scoped>
.time-analysis {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.peak-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff7e6;
  border: 1px solid #ffd591;
  padding: 16px 20px;
  border-radius: 8px;
}

.peak-info h4 {
  margin: 0 0 4px 0;
  color: #333;
}

.peak-info p {
  margin: 0;
  color: #666;
}

.highlight {
  font-weight: bold;
  color: #fa8c16;
}

.highlight.danger {
  color: #ff4d4f;
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

.chart-card h3 {
  margin: 0 0 15px 0;
  font-size: 1rem;
}

.chart {
  height: 300px;
  width: 100%;
}

.heatmap-section {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.heatmap-section h3 {
  margin: 0 0 15px 0;
}

.heatmap-bar {
  display: flex;
  gap: 2px;
  height: 60px;
}

.heatmap-cell {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.heatmap-cell:hover {
  transform: scaleY(1.1);
}

.hour-label {
  font-size: 0.7rem;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.legend-gradient {
  width: 200px;
  height: 12px;
  background: linear-gradient(to right, #52c41a, #faad14, #ff4d4f);
  border-radius: 6px;
}
</style>
