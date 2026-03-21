import axios from 'axios'

// 基础配置，复用已有的配置逻辑
const API_BASE_URL = 'http://127.0.0.1:7022'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 图片上传可能较慢，设置30秒超时
})

// 请求拦截器：自动携带 Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  },
)

// --- 类型定义 ---

export interface UploadImageResponse {
  ok?: boolean
  message?: string
  data?: {
    imageId: number
    fileName: string
    filePath: string
    fileSize: number
    fileType: string
    width: number
    height: number
  }
  error?: boolean
  code?: string
}

export interface ImageItem {
  id: number
  imageId?: number // 兼容旧代码
  fileName: string
  filePath: string
  fileSize: number
  fileType: string
  width: number
  height: number
  createdAt: string
  status?: number // 0: 正常, 1: 已删除
  accessUrl?: string // 前端展示用
}

export interface ImageListResponse {
  ok?: boolean
  data?: {
    list: ImageItem[]
    total: number
    page: number
    pageSize: number
  }
  error?: boolean
  message?: string
}

export interface GetImageIdsResponse {
  ok?: boolean
  data?: {
    userId: number
    imageIds: number[]
  }
  error?: boolean
  message?: string
}

export interface ImageDetailResponse {
  ok?: boolean
  data?: ImageItem & {
    accessUrl?: string
    base64Content?: string
    isDetected?: boolean
    detectionDate?: string
    modelName?: string
    results?: DetectionBox[]
  }
  error?: boolean
  message?: string
}

export interface DeleteResponse {
  ok?: boolean
  message?: string
  error?: boolean
}

export interface BatchDeleteRequest {
  imageIds: number[]
}

export interface BatchDeleteResponse {
  ok?: boolean
  message?: string
  data?: {
    successIds: number[]
    failIds: number[]
    failReasons: Record<string, string>
  }
  error?: boolean
}

// 检测结果相关类型
export interface DetectionBox {
  label: string
  score: number
  x: number
  y: number
  width: number
  height: number
  classId: number
}

export interface BatchDetectRequest {
  imageIds: number[]
}

// Map<imageId, DetectionBox[]>
export type BatchDetectResponse = Record<string, DetectionBox[]>

// 单张检测响应 (旧接口返回数组)
export type SingleDetectResponse = DetectionBox[]

// --- API 方法 ---

// 1. 上传图片
export const uploadImage = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<UploadImageResponse>('/api/file/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// 2. 获取用户图片列表
export const listImages = async (params?: {
  page?: number
  pageSize?: number
  fileType?: string
  keyword?: string
  label?: string
}): Promise<ImageListResponse> => {
  const response = await apiClient.get<ImageListResponse>('/api/file/list-images', { params })
  return response.data
}

// 3. 删除图片
export const deleteImage = async (imageId: number): Promise<DeleteResponse> => {
  const response = await apiClient.delete<DeleteResponse>(`/api/file/delete-image/${imageId}`)
  return response.data
}

// 4. 获取用户所有图片ID
export const getImageIds = async (): Promise<GetImageIdsResponse> => {
  const response = await apiClient.get<GetImageIdsResponse>('/api/file/get-image-ids')
  return response.data
}

// 5. 根据ID获取图片详情（含访问链接）
export const getImageById = async (imageId: number): Promise<ImageDetailResponse> => {
  const response = await apiClient.get<ImageDetailResponse>(`/api/file/get-image-by-id/${imageId}`)
  return response.data
}

// 6. 批量删除图片
export const batchDeleteImages = async (imageIds: number[]): Promise<BatchDeleteResponse> => {
  const response = await apiClient.post<BatchDeleteResponse>('/api/file/batch-delete-images', {
    imageIds,
  })
  return response.data
}

// 7. 批量检测
export const detectBatch = async (imageIds: number[]): Promise<BatchDetectResponse> => {
  const response = await apiClient.post<BatchDetectResponse>('/model/detectBatch', { imageIds })
  return response.data
}

// 8. 单张检测 (旧接口)
export const detectSingle = async (file: File): Promise<SingleDetectResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<SingleDetectResponse>('/model/detect', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// --- 视频接口 ---

export interface VideoListResponse {
  ok?: boolean
  error?: boolean
  message?: string
  code?: string
  data?: {
    list: Record<string, unknown>[]
    total: number
    page: number
    pageSize: number
  }
}

export const uploadVideo = async (
  file: File,
  description?: string,
  generateCover: boolean = true,
) => {
  const formData = new FormData()
  formData.append('file', file)
  if (description) {
    formData.append('description', description)
  }
  formData.append('generateCover', String(generateCover))

  const response = await apiClient.post('/api/file/upload-video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // 可选：添加上传进度监控
    // onUploadProgress: progressEvent => { ... }
  })
  return response.data
}

export const listVideos = async (params?: {
  page?: number
  pageSize?: number
  fileType?: string
}): Promise<VideoListResponse> => {
  const response = await apiClient.get<VideoListResponse>('/api/file/list-videos', { params })
  return response.data
}

export const deleteVideo = async (videoId: number | string) => {
  const response = await apiClient.delete(`/api/file/delete-video/${videoId}`)
  return response.data
}

export const detectVideo = async (videoId: number | string) => {
  const response = await apiClient.post(`/model/detectVideo/${videoId}`)
  return response.data
}
