<template>
  <div class="detection-container">
    <!-- 顶部工具栏 -->
    <el-card class="toolbar-card" shadow="never">
      <div class="toolbar-content">
        <div class="left-actions">
          <el-upload
            class="upload-btn"
            action="#"
            :auto-upload="true"
            :show-file-list="false"
            :http-request="customUpload"
            accept="video/mp4,video/mov,video/webm"
          >
            <el-button type="primary" :icon="Upload" :loading="uploading">上传视频</el-button>
          </el-upload>

          <el-button
            :icon="Refresh"
            circle
            @click="loadVideos"
            :loading="loading"
            title="刷新列表"
            style="margin-left: 12px"
          />
        </div>
      </div>
    </el-card>

    <!-- 视频展示区域 -->
    <div class="content-wrapper" v-loading="loading">
      <div class="video-grid-container">
        <el-empty v-if="videos.length === 0" description="暂无视频数据" />

        <el-row :gutter="20" v-else>
          <el-col
            v-for="video in videos"
            :key="video.videoId"
            v-bind="gridConfig"
            class="video-col"
          >
            <el-card class="video-card" shadow="hover" :body-style="{ padding: '0px' }">
              <div
                class="video-wrapper"
                v-loading="video.detecting"
                :element-loading-text="video.detecting ? `检测中... ${video.progress}%` : ''"
                element-loading-background="rgba(255, 255, 255, 0.7)"
                :style="{ height: '350px' }"
              >
                <!-- 封面或视频预览 -->
                <el-image
                  v-if="video.coverPath"
                  :src="API_BASE_URL + video.coverPath"
                  fit="cover"
                  class="video-thumb"
                  loading="lazy"
                  style="pointer-events: none; width: 100%; height: 100%; display: block"
                >
                  <template #placeholder>
                    <div class="image-slot">Loading...</div>
                  </template>
                </el-image>
                <div v-else class="no-cover">
                  <el-icon :size="40"><VideoPlay /></el-icon>
                </div>

                <!-- 状态标签 -->
                <div class="status-tag">
                  <el-tag v-if="video.detected" type="success" size="small" effect="dark"
                    >已检测</el-tag
                  >
                  <el-tag v-else type="info" size="small" effect="dark">待检测</el-tag>
                </div>

                <div class="duration-tag" v-if="video.duration">
                  {{ formatDuration(video.duration) }}
                </div>
              </div>

              <div class="card-footer">
                <div class="file-info">
                  <span class="file-name" :title="video.fileName">{{ video.fileName }}</span>
                  <span class="file-date">{{ video.date }}</span>
                </div>

                <div class="card-actions">
                  <el-tooltip content="执行检测" placement="top">
                    <el-button
                      circle
                      size="small"
                      type="primary"
                      :icon="Aim"
                      @click="handleDetect(video)"
                      :disabled="video.detecting"
                    />
                  </el-tooltip>
                  <el-tooltip content="查看结果" placement="top" v-if="video.detected">
                    <el-button
                      circle
                      size="small"
                      type="success"
                      :icon="View"
                      @click="viewResult(video)"
                    />
                  </el-tooltip>
                  <el-tooltip content="删除视频" placement="top">
                    <el-button
                      circle
                      size="small"
                      type="danger"
                      :icon="Delete"
                      @click="handleDelete(video)"
                    />
                  </el-tooltip>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 分页组件固定在底部 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          background
          layout="total, prev, pager, next, jumper"
          :total="total"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="视频检测详情"
      width="90%"
      top="5vh"
      destroy-on-close
      center
      class="detail-dialog"
      @closed="onDialogClosed"
    >
      <div class="detail-content" v-if="currentVideo">
        <!-- 控制栏 -->
        <div class="toolbar">
          <el-button-group>
            <el-button :icon="ZoomIn" @click="handleZoom(0.1)" title="放大" />
            <el-button :icon="ZoomOut" @click="handleZoom(-0.1)" title="缩小" />
            <el-button :icon="RefreshLeft" @click="resetZoom" title="重置" />
          </el-button-group>
          <span style="margin-left: 10px; font-size: 14px; color: #666"
            >缩放比例: {{ Math.round(videoScale * 100) }}%</span
          >
        </div>

        <div
          class="video-player-container"
          ref="videoContainerRef"
          @wheel.prevent="handleWheel"
          @mousedown.prevent="startDrag"
          @mousemove.prevent="onDrag"
          @mouseup="stopDrag"
          @mouseleave="stopDrag"
        >
          <div
            class="video-wrapper-inner"
            :style="{
              position: 'relative',
              display: 'inline-block',
              transform: `translate(${videoTranslate.x}px, ${videoTranslate.y}px) scale(${videoScale})`,
              transformOrigin: 'center',
              cursor: isDragging ? 'grabbing' : 'grab',
              transition: isDragging ? 'none' : 'transform 0.1s',
              backgroundColor: '#ccc',
              lineHeight: 0,
            }"
          >
            <video
              ref="videoPlayerRef"
              :src="API_BASE_URL + currentVideo.filePath"
              controls
              class="video-player"
              @timeupdate="onTimeUpdate"
              @loadedmetadata="onVideoLoaded"
            ></video>

            <!-- 覆盖在视频上的检测框 -->
            <div
              v-for="(box, idx) in currentDetections"
              :key="idx"
              class="video-detection-box"
              :style="{
                left: (box.x / videoOriginalWidth) * 100 + '%',
                top: (box.y / videoOriginalHeight) * 100 + '%',
                width: (box.width / videoOriginalWidth) * 100 + '%',
                height: (box.height / videoOriginalHeight) * 100 + '%',
              }"
            >
              <span class="box-label">{{ box.label }} {{ (box.score * 100).toFixed(1) }}%</span>
            </div>
          </div>
        </div>

        <div class="detail-info" style="margin-top: 20px">
          <h3>异常帧列表 (共 {{ currentVideo.anomalyCount }} 处异常)</h3>
          <el-table
            :data="currentVideo.anomalyFrames"
            stripe
            style="width: 100%"
            size="small"
            border
          >
            <el-table-column prop="timeFormatted" label="时间点" width="120">
              <template #default="scope">
                <el-button link type="primary" @click="seekTo(scope.row.time)">
                  {{ scope.row.timeFormatted }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="frameNumber" label="帧序号" width="100" />
            <el-table-column label="检测结果">
              <template #default="scope">
                <div v-for="(det, idx) in scope.row.detections" :key="idx" class="detection-tag">
                  <el-tag size="small" type="danger">
                    {{ det.label }} ({{ (det.score * 100).toFixed(1) }}%)
                  </el-tag>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Upload,
  Delete,
  Aim,
  View,
  Refresh,
  VideoPlay,
  ZoomIn,
  ZoomOut,
  RefreshLeft,
} from '@element-plus/icons-vue'
import * as VideoApi from '@/api/video_api'
import type { UploadRequestOptions } from 'element-plus'

const API_BASE_URL = 'http://127.0.0.1:7022'

interface VideoItemUI extends VideoApi.VideoItem {
  date: string
  detecting: boolean
  detected: boolean
  progress: number
  anomalyCount?: number
  anomalyFrames?: VideoApi.AnomalyFrame[]
}

const loading = ref(false)
const uploading = ref(false)
const videos = ref<VideoItemUI[]>([])
const detailVisible = ref(false)
const currentVideo = ref<VideoItemUI | null>(null)
const videoPlayerRef = ref<HTMLVideoElement | null>(null)
const videoContainerRef = ref<HTMLElement | null>(null)

const currentDetections = ref<VideoApi.DetectionBox[]>([])
const videoOriginalWidth = ref(640)
const videoOriginalHeight = ref(640)

// 缩放和拖拽状态
const videoScale = ref(1)
const videoTranslate = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// 分页状态
const currentPage = ref(1)
const pageSize = ref(4) // 默认 4，且不可修改
const total = ref(0)

const gridConfig = computed(() => {
  // 固定每行展示两个（占12格），如果是超小屏幕则占满（24格）
  return { xs: 24, sm: 24, md: 12, lg: 12, xl: 12 }
})

onMounted(() => {
  loadVideos()
})

const loadVideos = async () => {
  loading.value = true
  try {
    const res = await VideoApi.listVideos({
      page: currentPage.value,
      pageSize: pageSize.value,
    })

    if (res.ok && res.data) {
      total.value = res.data.total
      videos.value = res.data.list.map((item) => ({
        ...item,
        videoId: item.id || item.videoId || 0,
        date: item.createdAt || new Date().toLocaleDateString('zh-CN'),
        detecting: false,
        detected: item.isDetected === 1,
        progress: item.isDetected === 1 ? 100 : 0,
        anomalyCount: item.anomalyCount,
        anomalyFrames: item.anomalyFrames,
      }))
    } else {
      ElMessage.error(res.message || '获取视频列表失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('加载异常')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadVideos()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadVideos()
}

const customUpload = async (options: UploadRequestOptions) => {
  uploading.value = true
  try {
    const res = await VideoApi.uploadVideo(options.file, '', true)
    if (res.ok) {
      ElMessage.success('上传成功')
      currentPage.value = 1
      loadVideos()
    } else {
      ElMessage.error(res.message || '上传失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('上传异常')
  } finally {
    uploading.value = false
  }
}

const handleDelete = async (video: VideoItemUI) => {
  try {
    await ElMessageBox.confirm(`确定要删除视频 "${video.fileName}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const res = await VideoApi.deleteVideo(video.videoId)
    if (res.ok) {
      ElMessage.success('删除成功')
      loadVideos()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
      ElMessage.error('删除异常')
    }
  }
}

const handleDetect = async (video: VideoItemUI) => {
  video.detecting = true
  video.progress = 0

  try {
    const res = await VideoApi.detectVideo(video.videoId)
    if (res.ok) {
      ElMessage.success('已加入检测队列')
      // 开始轮询进度
      pollProgress(video)
    } else {
      ElMessage.error(res.message || '启动检测失败')
      video.detecting = false
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('检测异常')
    video.detecting = false
  }
}

const pollProgress = async (video: VideoItemUI) => {
  const timer = setInterval(async () => {
    try {
      const res = await VideoApi.getDetectProgress(video.videoId)
      if (res.ok) {
        video.progress = res.progress || 0

        if (res.progress === 100) {
          clearInterval(timer)
          video.detecting = false
          video.detected = true
          if (res.data) {
            video.anomalyCount = res.data.anomalyCount
            video.anomalyFrames = res.data.anomalyFrames
          }
          ElMessage.success(`视频 "${video.fileName}" 检测完成`)
        } else if (res.progress === -1) {
          clearInterval(timer)
          video.detecting = false
          ElMessage.error(`视频 "${video.fileName}" 检测失败`)
        }
      }
    } catch (error) {
      console.error('获取进度异常', error)
      clearInterval(timer)
      video.detecting = false
    }
  }, 2000) // 每 2 秒轮询一次
}

const viewResult = (video: VideoItemUI) => {
  currentVideo.value = video
  detailVisible.value = true
}

const seekTo = (time: number) => {
  if (videoPlayerRef.value) {
    videoPlayerRef.value.currentTime = time
    videoPlayerRef.value.play()
  }
}

const onVideoLoaded = () => {
  if (videoPlayerRef.value) {
    videoOriginalWidth.value = videoPlayerRef.value.videoWidth || 640
    videoOriginalHeight.value = videoPlayerRef.value.videoHeight || 640
    resetZoom()
  }
}

const onTimeUpdate = () => {
  if (!videoPlayerRef.value || !currentVideo.value?.anomalyFrames) return

  const currentTime = videoPlayerRef.value.currentTime
  // 查找当前时间点 +/- 0.5 秒内的异常帧
  const threshold = 0.5

  const activeFrame = currentVideo.value.anomalyFrames.find(
    (frame) => Math.abs(frame.time - currentTime) < threshold,
  )

  if (activeFrame) {
    currentDetections.value = activeFrame.detections
  } else {
    currentDetections.value = []
  }
}

const getBoxStyle = (box: VideoApi.DetectionBox) => {
  return {}
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const handleZoom = (delta: number) => {
  videoScale.value = Math.max(0.1, Math.min(5, videoScale.value + delta))
}

const resetZoom = () => {
  videoScale.value = 1
  videoTranslate.value = { x: 0, y: 0 }
}

const handleWheel = (e: WheelEvent) => {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  handleZoom(delta)
}

const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  dragStart.value = {
    x: e.clientX - videoTranslate.value.x,
    y: e.clientY - videoTranslate.value.y,
  }
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  videoTranslate.value = {
    x: e.clientX - dragStart.value.x,
    y: e.clientY - dragStart.value.y,
  }
}

const stopDrag = () => {
  isDragging.value = false
}

const onDialogClosed = () => {
  if (videoPlayerRef.value) {
    videoPlayerRef.value.pause()
  }
  resetZoom()
}
</script>

<style scoped>
.detection-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
  background-color: #f5f7fa;
  padding: 16px;
  box-sizing: border-box;
}

.toolbar-card {
  border-radius: 8px;
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-btn {
  display: inline-block;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background-color: transparent;
}

.video-grid-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  padding-bottom: 20px;
}

.video-col {
  margin-bottom: 20px;
}

.video-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1) !important;
}

.video-wrapper {
  position: relative;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.no-cover {
  color: #fff;
  opacity: 0.5;
}

.status-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
}

.duration-tag {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 2;
}

.card-footer {
  padding: 12px 16px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-right: 10px;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.file-date {
  font-size: 12px;
  color: #909399;
}

.card-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.pagination-wrapper {
  margin-top: 16px;
  padding: 12px 0;
  display: flex;
  justify-content: center;
  background-color: transparent;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.video-player-container {
  position: relative;
  width: 100%;
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;
  overflow: hidden;
}

.video-wrapper-inner {
  position: relative;
  display: inline-block;
  line-height: 0;
  /* 取消背景色避免干扰，让video原生背景展示 */
  background-color: transparent;
}

.video-player {
  /* 固定大小以便与检测框对齐 */
  display: block;
  max-width: none;
  max-height: none;
}

.video-detection-box {
  position: absolute;
  border: 2px solid #f56c6c;
  background-color: rgba(245, 108, 108, 0.2);
  pointer-events: none;
  z-index: 10;
}

.video-detection-box .box-label {
  position: absolute;
  top: -24px;
  left: -2px;
  background-color: #f56c6c;
  color: #fff;
  padding: 2px 6px;
  font-size: 12px;
  white-space: nowrap;
  border-radius: 4px 4px 4px 0;
}

.detection-tag {
  display: inline-block;
  margin-right: 8px;
  margin-bottom: 4px;
}
</style>
