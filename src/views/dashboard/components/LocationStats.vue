<template>
  <div class="location-stats">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="map-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span
                >上传图像 位置分布地图 (总计: {{ locationData.totalLocations || 0 }} 个位置)</span
              >
            </div>
          </template>
          <div class="map-container">
            <div
              id="stats-amap-container"
              style="width: 100%; height: 500px; border-radius: 4px"
            ></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'

const props = defineProps<{
  locationData: Record<string, any>
}>()

let mapInstance: any = null
let markers: any[] = []

const initMap = () => {
  if (typeof (window as any).AMap === 'undefined') return

  // @ts-ignore
  mapInstance = new AMap.Map('stats-amap-container', {
    zoom: 4,
    center: [104.06, 30.67], // 默认中心点（成都附近或中国中心）
  })

  updateMarkers()
}

const updateMarkers = () => {
  if (!mapInstance) return

  // 清除旧的 marker
  if (markers.length > 0) {
    mapInstance.remove(markers)
    markers = []
  }

  const locations = props.locationData.locations || []
  if (locations.length === 0) return

  locations.forEach((loc: any) => {
    if (!loc.longitude || !loc.latitude) return

    // 根据是否检测/是否有异常设置不同颜色或图标
    // @ts-ignore
    const marker = new AMap.Marker({
      position: [loc.longitude, loc.latitude],
      title: loc.fileName || '图片位置',
    })

    // 动态生成带颜色的 SVG 图标来替代失效的官方图片
    let fillColor = '#409eff' // 默认蓝色
    if (loc.hasAnomaly) {
      fillColor = '#f56c6c' // 红色 (有异常)
    } else if (loc.isDetected) {
      fillColor = '#67c23a' // 绿色 (正常)
    }

    const svgIcon = `
      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="30" height="30">
        <path d="M512 85.333333c-164.928 0-298.666667 133.738667-298.666667 298.666667 0 164.928 298.666667 554.666667 298.666667 554.666667s298.666667-389.738667 298.666667-554.666667c0-164.928-133.738667-298.666667-298.666667-298.666667z m0 426.666667c-70.698667 0-128-57.301333-128-128s57.301333-128 128-128 128 57.301333 128 128-57.301333 128-128 128z" fill="${fillColor}"></path>
      </svg>
    `
    const iconUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgIcon)))

    // @ts-ignore
    const icon = new AMap.Icon({
      size: new AMap.Size(30, 30),
      image: iconUrl,
      imageSize: new AMap.Size(30, 30),
    })
    marker.setIcon(icon)

    // 添加信息窗体
    // @ts-ignore
    const infoWindow = new AMap.InfoWindow({
      content: `
        <div style="padding:10px;min-width:200px;">
          <h4 style="margin:0 0 10px 0;border-bottom:1px solid #eee;padding-bottom:5px;">位置信息</h4>
          <p style="margin:5px 0;font-size:13px;"><b>文件名:</b> ${loc.fileName || '未知'}</p>
          <p style="margin:5px 0;font-size:13px;"><b>上传用户:</b> ${loc.userName || '未知'} (ID: ${loc.userId || '未知'})</p>
          <p style="margin:5px 0;font-size:13px;"><b>地址:</b> ${loc.address || '未知'}</p>
          <p style="margin:5px 0;font-size:13px;"><b>坐标:</b> ${loc.longitude.toFixed(4)}, ${loc.latitude.toFixed(4)}</p>
          <p style="margin:5px 0;font-size:13px;">
            <b>状态:</b>
            <span style="color:${loc.hasAnomaly ? '#f56c6c' : loc.isDetected ? '#67c23a' : '#909399'}">
              ${loc.hasAnomaly ? '发现异常' : loc.isDetected ? '正常' : '未检测'}
            </span>
          </p>
        </div>
      `,
      offset: new AMap.Pixel(0, -30),
    })

    marker.on('click', () => {
      infoWindow.open(mapInstance, marker.getPosition())
    })

    markers.push(marker)
  })

  mapInstance.add(markers)
  mapInstance.setFitView()
}

onMounted(() => {
  // 确保DOM挂载完成
  nextTick(() => {
    initMap()
  })
})

watch(
  () => props.locationData,
  () => {
    updateMarkers()
  },
  { deep: true },
)
</script>

<style scoped>
.location-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.card-header {
  font-weight: bold;
}
.map-container {
  position: relative;
}
</style>
