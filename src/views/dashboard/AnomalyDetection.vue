<template>
  <div class="detection-container">
    <!-- 顶部工具栏 -->
    <el-card class="toolbar-card" shadow="never">
      <div class="toolbar-content">
        <div class="left-actions">
          <el-upload
            class="upload-btn"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleUploadFile"
            accept="image/*"
            multiple
          >
            <el-button type="primary" :icon="Upload">上传图片</el-button>
          </el-upload>

          <el-button
            type="danger"
            plain
            :icon="Delete"
            :disabled="!selectedImageIds.length"
            @click="handleBatchDelete"
          >
            批量删除 ({{ selectedImageIds.length }})
          </el-button>

          <el-button
            type="success"
            plain
            :icon="Aim"
            :disabled="!selectedImageIds.length"
            @click="handleBatchDetect"
          >
            批量检测 ({{ selectedImageIds.length }})
          </el-button>
        </div>

        <div class="right-actions">
          <el-button
            :icon="Refresh"
            circle
            @click="loadImages"
            :loading="loading"
            title="刷新列表"
          />
          <el-input
            v-model="searchKeyword"
            placeholder="搜索图片名称..."
            class="search-input"
            clearable
            :prefix-icon="Search"
          />
        </div>
      </div>
    </el-card>

    <!-- 图片展示区域 -->
    <div class="content-wrapper" v-loading="loading">
      <div class="image-grid-container">
        <el-empty v-if="filteredImages.length === 0" description="暂无图片数据" />

        <el-row :gutter="20" v-else>
          <el-col
            v-for="img in filteredImages"
            :key="img.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            :xl="4"
            class="image-col"
          >
            <!-- ... existing card code ... -->
            <el-card
              class="image-card"
              :class="{ 'is-selected': selectedImageIds.includes(img.id) }"
              shadow="hover"
              :body-style="{ padding: '0px' }"
              @click="toggleSelection(img.id)"
            >
              <div
                class="image-wrapper"
                v-loading="img.loading"
                element-loading-text="检测中..."
                element-loading-background="rgba(255, 255, 255, 0.7)"
                @click.stop="toggleSelection(img.id)"
              >
                <el-image
                  :src="img.url"
                  fit="cover"
                  class="image-thumb"
                  loading="lazy"
                  style="pointer-events: none; width: 100%; height: 100%; display: block"
                >
                  <template #placeholder>
                    <div class="image-slot">Loading...</div>
                  </template>
                </el-image>

                <!-- 选择遮罩 -->
                <div
                  class="selection-overlay"
                  v-if="selectedImageIds.includes(img.id)"
                  style="pointer-events: none"
                >
                  <el-icon class="check-icon"><Check /></el-icon>
                </div>

                <!-- 状态标签 -->
                <div class="status-tag">
                  <el-tag v-if="img.status === 'detected'" type="success" size="small" effect="dark"
                    >已检测</el-tag
                  >
                  <el-tag v-else type="info" size="small" effect="dark">待检测</el-tag>
                </div>
              </div>

              <div class="card-footer" @click.stop>
                <div class="file-info">
                  <span class="file-name" :title="img.name">{{ img.name }}</span>
                  <span class="file-date">{{ img.date }}</span>
                </div>

                <div class="card-actions">
                  <el-tooltip content="执行检测" placement="top">
                    <el-button
                      circle
                      size="small"
                      type="primary"
                      :icon="Aim"
                      @click="handleSingleDetect(img)"
                    />
                  </el-tooltip>
                  <el-tooltip content="查看详情" placement="top" v-if="img.status === 'detected'">
                    <el-button
                      circle
                      size="small"
                      type="info"
                      :icon="View"
                      @click="viewDetail(img)"
                    />
                  </el-tooltip>
                  <el-tooltip content="删除图片" placement="top">
                    <el-button
                      circle
                      size="small"
                      type="danger"
                      :icon="Delete"
                      @click="handleSingleDelete(img)"
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
          background
          layout="prev, pager, next, jumper, total"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="检测详情"
      width="90%"
      top="5vh"
      destroy-on-close
      center
      class="detail-dialog"
    >
      <div class="detail-content" v-if="currentImage">
        <div class="detail-header-info">
          <el-descriptions border :column="3" size="small">
            <el-descriptions-item label="文件名">{{ currentImage.name }}</el-descriptions-item>
            <el-descriptions-item label="检测日期">{{
              currentImage.detectionDate || 'N/A'
            }}</el-descriptions-item>
            <el-descriptions-item label="使用模型">{{
              currentImage.modelName || 'Unknown'
            }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div
          class="detail-image-wrapper"
          @wheel.prevent="handleWheel"
          @mousedown.prevent="startDrag"
          @mousemove.prevent="onDrag"
          @mouseup="stopDrag"
          @mouseleave="stopDrag"
        >
          <div
            class="image-container"
            :style="{
              position: 'relative',
              display: 'inline-block',
              transform: `translate(${imageTranslate.x}px, ${imageTranslate.y}px) scale(${imageScale})`,
              transformOrigin: 'center',
              cursor: isDragging ? 'grabbing' : 'grab',
              transition: isDragging ? 'none' : 'transform 0.1s',
            }"
          >
            <img :src="currentImage.url" class="detail-image" alt="Detail" />

            <!-- 检测框覆盖层 -->
            <div
              v-for="(box, idx) in currentImage.results"
              :key="idx"
              class="detection-box"
              :style="{
                left: (box.x / (currentImage.width || 640)) * 100 + '%',
                top: (box.y / (currentImage.height || 640)) * 100 + '%',
                width: (box.width / (currentImage.width || 640)) * 100 + '%',
                height: (box.height / (currentImage.height || 640)) * 100 + '%',
              }"
            >
              <span class="box-label">{{ box.label }} {{ (box.score * 100).toFixed(1) }}%</span>
            </div>
          </div>
        </div>

        <div class="detail-info">
          <h3>检测结果列表</h3>
          <el-table :data="currentImage.results" stripe style="width: 100%" size="small" border>
            <el-table-column prop="label" label="类别" width="100" />
            <el-table-column label="置信度" width="120">
              <template #default="scope"> {{ (scope.row.score * 100).toFixed(2) }}% </template>
            </el-table-column>
            <el-table-column label="位置 (x, y, w, h)">
              <template #default="scope">
                {{ scope.row.x.toFixed(1) }}, {{ scope.row.y.toFixed(1) }},
                {{ scope.row.width.toFixed(1) }}, {{ scope.row.height.toFixed(1) }}
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
import { Upload, Delete, Search, Aim, Check, View, Refresh } from '@element-plus/icons-vue'
import * as DetectionApi from '@/api/detection_api'
import type { UploadFile } from 'element-plus/es/components/upload/src/upload'

// 类型定义
interface DetectionResult {
  label: string
  score: number
  x: number
  y: number
  width: number
  height: number
  classId: number
}

interface ImageItem {
  id: number
  url: string
  name: string
  date: string
  status: 'pending' | 'detected'
  results?: DetectionResult[]
  detectionDate?: string
  modelName?: string
  width?: number
  height?: number
  loading?: boolean
}

// 状态
const loading = ref(false)
const searchKeyword = ref('')
const selectedImageIds = ref<number[]>([])
const images = ref<ImageItem[]>([])
const detailVisible = ref(false)
const currentImage = ref<ImageItem | null>(null)

// 分页状态
const currentPage = ref(1)
const pageSize = ref(18)
const total = ref(0)

// 数据初始化
onMounted(() => {
  loadImages()
})

const loadImages = async () => {
  loading.value = true
  try {
    const res = await DetectionApi.listImages({
      page: currentPage.value,
      pageSize: pageSize.value,
    })

    if (res.ok && res.data) {
      const list = res.data.list
      total.value = res.data.total

      // 这里的 list 只有基础信息，需要补充检测详情
      // 如果后端 listImages 不返回检测结果，我们可能需要单独查
      // 但为了性能，最好是 listImages 直接返回检测状态
      // 目前 listImages 只返回了 Image 实体。
      // 我们需要在 listImages 接口里关联查询 detection status 吗？
      // 或者，我们依然遍历 fetch details？
      // 鉴于 listImages 只有分页的 10 条，遍历 fetch 也是可以接受的。
      // 为了用户体验，我们先显示列表，然后异步加载状态？
      // 或者直接 Promise.all 加载详情。

      // 暂时采用 Promise.all 加载详情的方式，确保信息完整
      // 注意：后端返回的 list 中的实体对象主键通常是 id，而不是 imageId
      // 使用 unknown 类型断言来避免 any
      const promises = list.map((item: unknown) => {
        const img = item as { id: number; imageId?: number }
        return DetectionApi.getImageById(img.id || img.imageId || 0)
      })
      const details = await Promise.all(promises)

      images.value = details
        .filter((d) => d.ok && d.data)
        .map((d) => {
          const item = d.data!
          return {
            id: item.imageId,
            url: item.accessUrl || item.base64Content || '',
            name: item.fileName,
            date: new Date(item.createdAt).toLocaleDateString('zh-CN'),
            status: (item.isDetected ? 'detected' : 'pending') as 'detected' | 'pending',
            results: item.results || [],
            detectionDate: item.detectionDate,
            modelName: item.modelName,
            width: item.width,
            height: item.height,
          }
        })
    } else {
      ElMessage.error(res.message || '获取图片列表失败')
    }
  } catch (error) {
    console.error('Failed to load images:', error)
    ElMessage.error('网络错误，无法加载图片')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadImages()
}

// 计算属性
const filteredImages = computed(() => {
  if (!searchKeyword.value) return images.value
  return images.value.filter((img) =>
    img.name.toLowerCase().includes(searchKeyword.value.toLowerCase()),
  )
})

// 方法
const handleUploadFile = async (file: UploadFile) => {
  // loading.value = true // 不要使用全局 loading，避免锁定整个页面
  try {
    if (!file.raw) {
      throw new Error('File raw data is missing')
    }
    const res = await DetectionApi.uploadImage(file.raw)
    if (res.ok && res.data) {
      ElMessage.success(`图片 ${file.name} 上传成功`)
      // 重新加载列表
      loadImages()
    } else {
      ElMessage.error(res.message || '上传失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('上传出错')
  } finally {
    // loading.value = false
  }
}

const toggleSelection = (id: number) => {
  const index = selectedImageIds.value.indexOf(id)
  if (index > -1) {
    selectedImageIds.value.splice(index, 1)
  } else {
    selectedImageIds.value.push(id)
  }
}

const handleSingleDelete = (img: ImageItem) => {
  ElMessageBox.confirm('确定要删除这张图片吗？此操作无法恢复。', '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      // loading.value = true // 改为局部 loading
      img.loading = true
      try {
        const res = await DetectionApi.deleteImage(img.id)
        if (res.ok) {
          images.value = images.value.filter((item) => item.id !== img.id)
          selectedImageIds.value = selectedImageIds.value.filter((id) => id !== img.id)
          ElMessage.success('删除成功')
        } else {
          ElMessage.error(res.message || '删除失败')
        }
      } catch (error) {
        console.error(error)
        ElMessage.error('操作失败')
      } finally {
        // loading.value = false
        img.loading = false
      }
    })
    .catch(() => {
      // Catch cancel action to prevent unhandled rejection
    })
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedImageIds.value.length} 张图片吗？`, '警告', {
    confirmButtonText: '批量删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      loading.value = true
      try {
        const res = await DetectionApi.batchDeleteImages(selectedImageIds.value)
        if (res.ok) {
          const successIds = res.data?.successIds || []
          images.value = images.value.filter((item) => !successIds.includes(item.id))
          selectedImageIds.value = []
          ElMessage.success(`成功删除 ${successIds.length} 张图片`)
          loadImages() // 刷新列表以确保状态同步
        } else {
          ElMessage.error(res.message || '批量删除失败')
        }
      } catch (error) {
        console.error(error)
        ElMessage.error('操作失败')
      } finally {
        loading.value = false
      }
    })
    .catch(() => {
      // Catch cancel action
    })
}

// 单张检测（复用批量检测接口，只是传一个ID）
const handleSingleDetect = async (img: ImageItem) => {
  // loading.value = true // 改为局部 loading
  img.loading = true
  try {
    const resMap = await DetectionApi.detectBatch([img.id])
    // 结果是 Map<imageId, results>
    const results = resMap[img.id.toString()] || []

    img.status = 'detected'
    img.results = results
    img.detectionDate = new Date().toLocaleString('zh-CN') // 立即更新检测时间
    img.modelName = 'YOLOv8-best.onnx' // 立即更新模型名称 (或者从后端获取)

    if (results.length > 0) {
      ElMessage.success(`检测完成，发现 ${results.length} 处异常`)
    } else {
      ElMessage.info('检测完成，未发现异常')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('检测请求失败')
  } finally {
    // loading.value = false
    img.loading = false
  }
}

const handleBatchDetect = async () => {
  const ids = [...selectedImageIds.value] // Create a copy of IDs to process
  if (ids.length === 0) return

  // 设置所有选中图片的 loading 状态
  images.value.forEach((img) => {
    if (ids.includes(img.id)) {
      img.loading = true
    }
  })

  // 清空选择，避免重复操作，但保留 ids 用于处理
  selectedImageIds.value = []

  // 并发处理每个图片的检测请求
  // 为了不阻塞界面，我们使用 Promise.allSettled 或者逐个处理
  // 这里为了更好的用户体验（各自进度），我们并发发起单张检测请求（或者小批量），
  // 但由于后端 detectBatch 本身支持批量，我们可以利用它。
  // 为了实现“各自显示动画与检测进度同步”，我们需要知道每个图片的完成时刻。
  // 如果调用一次 batchDetect，后端是串行或并行处理完所有才返回，前端只能一起结束 loading。
  // 所以，为了“各自结束 loading”，我们需要在前段将批量拆分为多个单张请求并发执行。

  const detectPromises = ids.map(async (id) => {
    try {
      // 调用批量接口但只传一个ID，或者调用单张接口
      // 这里复用 detectBatch 接口传单ID，因为逻辑一致
      const resMap = await DetectionApi.detectBatch([id])
      const results = resMap[id.toString()] || []

      // 找到对应的图片对象并更新状态
      const img = images.value.find((item) => item.id === id)
      if (img) {
        img.status = 'detected'
        img.results = results
        img.detectionDate = new Date().toLocaleString('zh-CN')
        img.modelName = 'YOLOv8-best.onnx'
        img.loading = false // 单独结束 loading
      }
      return { id, success: true, count: results.length }
    } catch (error) {
      console.error(`Failed to detect image ${id}`, error)
      const img = images.value.find((item) => item.id === id)
      if (img) img.loading = false
      return { id, success: false, count: 0 }
    }
  })

  // 等待所有请求完成以显示最终汇总信息（可选）
  const results = await Promise.all(detectPromises)
  const totalIssues = results.reduce((sum, res) => sum + res.count, 0)
  const successCount = results.filter((r) => r.success).length

  if (successCount > 0) {
    ElMessage.success(`批量检测结束，${successCount} 张图片处理完成，共发现 ${totalIssues} 处异常`)
  } else {
    ElMessage.warning('批量检测未成功处理任何图片')
  }
}

const imageScale = ref(1)
const imageTranslate = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const startDragPos = ref({ x: 0, y: 0 })

const resetImageTransform = () => {
  imageScale.value = 1
  imageTranslate.value = { x: 0, y: 0 }
}

const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  const scaleBy = 1.1
  const oldScale = imageScale.value
  const newScale = e.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy

  // 限制缩放范围
  if (newScale < 0.1 || newScale > 5) return

  imageScale.value = newScale
}

const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  startDragPos.value = {
    x: e.clientX - imageTranslate.value.x,
    y: e.clientY - imageTranslate.value.y,
  }
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  imageTranslate.value = {
    x: e.clientX - startDragPos.value.x,
    y: e.clientY - startDragPos.value.y,
  }
}

const stopDrag = () => {
  isDragging.value = false
}

const viewDetail = (img: ImageItem) => {
  currentImage.value = img
  detailVisible.value = true
  resetImageTransform()
}
</script>

<style scoped>
.detection-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 80px);
}

.toolbar-card {
  margin-bottom: 20px;
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.left-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 250px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 160px); /* 减去顶部栏和header的高度 */
}

.image-grid-container {
  flex: 1; /* 让图片网格占据剩余空间 */
  min-height: 400px;
}

.pagination-wrapper {
  margin-top: 20px;
  padding: 10px 0;
  display: flex;
  justify-content: center;
  background-color: #f5f7fa; /* 与背景色一致 */
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.image-col {
  margin-bottom: 20px;
}

.image-card {
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.image-card.is-selected {
  border: 2px solid #409eff !important;
  background-color: #f0f9eb;
  position: relative;
  z-index: 1;
}

.image-wrapper {
  position: relative;
  height: 200px;
  overflow: hidden;
  background-color: #eee;
}

.image-thumb {
  width: 100%;
  height: 100%;
  display: block;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
}

.selection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(64, 158, 255, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.check-icon {
  font-size: 48px;
  color: #409eff;
  background: white;
  border-radius: 50%;
  padding: 5px;
}

.status-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 5;
}

.card-footer {
  padding: 12px;
  background-color: #fff;
}

.file-info {
  margin-bottom: 10px;
}

.file-name {
  display: block;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.file-date {
  font-size: 12px;
  color: #909399;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.detail-dialog {
  overflow: hidden;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: calc(90vh - 120px); /* Adjust based on header/footer */
}

.detail-image-wrapper {
  position: relative;
  width: 100%;
  flex: 1; /* Take remaining space */
  min-height: 400px;
  overflow: hidden;
  border: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f0f0;
  padding: 0;
  cursor: grab;
}

.detail-image-wrapper:active {
  cursor: grabbing;
}

.detail-image {
  max-width: 100%;
  max-height: 100%;
  display: block;
  user-select: none;
  pointer-events: none;
}

.detection-box {
  position: absolute;
  border: 2px solid #f56c6c;
  background-color: rgba(245, 108, 108, 0.1);
  pointer-events: none;
  box-sizing: border-box; /* Ensure border is inside width/height if possible, but absolute positioning usually ignores padding/border for size unless configured */
}

.box-label {
  position: absolute;
  top: -22px;
  left: -2px;
  background-color: #f56c6c;
  color: white;
  padding: 2px 6px;
  font-size: 12px;
  white-space: nowrap;
  border-radius: 4px;
  z-index: 10;
}
</style>
