import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:7022'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 视频上传和检测可能较慢，设置60秒超时
})

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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  },
)

export interface UploadVideoResponse {
  ok?: boolean
  message?: string
  data?: {
    videoId: number
    fileName: string
    filePath: string
    fileSize: number
    fileType: string
    duration: number
    coverPath?: string
  }
  error?: boolean
  code?: string
}

export interface VideoItem {
  id?: number
  videoId?: number
  fileName: string
  filePath: string
  fileSize: number
  fileType: string
  duration: number
  coverPath?: string
  isDetected?: number
  anomalyCount?: number
  anomalyFrames?: AnomalyFrame[]
  createdAt: string
}

export interface VideoListResponse {
  ok?: boolean
  data?: {
    list: VideoItem[]
    total: number
    page: number
    pageSize: number
  }
  error?: boolean
  message?: string
  code?: string
}

export interface DeleteVideoResponse {
  ok?: boolean
  message?: string
  error?: boolean
  code?: string
}

export interface DetectionBox {
  label: string
  score: number
  x: number
  y: number
  width: number
  height: number
  classId: number
}

export interface AnomalyFrame {
  time: number
  timeFormatted: string
  frameNumber: number
  detections: DetectionBox[]
}

export interface DetectVideoResponse {
  ok?: boolean
  message?: string
  data?: {
    videoId: number
    totalFramesProcessed: number
    anomalyCount: number
    anomalyFrames: AnomalyFrame[]
  }
  error?: boolean
}

export interface DetectProgressResponse {
  ok?: boolean
  progress?: number
  message?: string
  data?: {
    videoId: number
    totalFramesProcessed: number
    anomalyCount: number
    anomalyFrames: AnomalyFrame[]
  }
  error?: boolean
}

// 1. 上传视频
export const uploadVideo = async (
  file: File,
  description?: string,
  generateCover: boolean = true,
): Promise<UploadVideoResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  if (description) {
    formData.append('description', description)
  }
  formData.append('generateCover', String(generateCover))

  const response = await apiClient.post<UploadVideoResponse>('/api/file/upload-video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// 2. 获取用户视频列表
export const listVideos = async (params?: {
  page?: number
  pageSize?: number
  fileType?: string
}): Promise<VideoListResponse> => {
  const response = await apiClient.get<VideoListResponse>('/api/file/list-videos', { params })
  return response.data
}

// 3. 删除视频
export const deleteVideo = async (videoId: number): Promise<DeleteVideoResponse> => {
  const response = await apiClient.delete<DeleteVideoResponse>(`/api/file/delete-video/${videoId}`)
  return response.data
}

// 4. 检测视频异常
export const detectVideo = async (videoId: number): Promise<DetectVideoResponse> => {
  const response = await apiClient.post<DetectVideoResponse>(`/model/detectVideo/${videoId}`)
  return response.data
}

// 5. 获取视频检测进度
export const getDetectProgress = async (videoId: number): Promise<DetectProgressResponse> => {
  const response = await apiClient.get<DetectProgressResponse>(
    `/model/detectVideo/progress/${videoId}`,
  )
  return response.data
}
