import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:7022'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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

export interface ImageOverviewResponse {
  ok?: boolean
  data?: {
    totalImages: number
    totalAnomalyImages: number
    anomalyRate: number
    topAnomalyType: { label: string; count: number; rate: number }[]
    dailyTrend: { date: string; total: number; anomaly: number }[]
  }
  error?: boolean
  message?: string
}

export interface VideoDetailResponse {
  ok?: boolean
  data?: {
    videoId: number
    fileName: string
    totalFrames: number
    detectedFrames: number
    anomalyTimeRatio: number
    topAnomalyFrames: { time: number; score: number; label: string }[]
    anomalyTypeDistribution: { label: string; count: number }[]
  }
  error?: boolean
  message?: string
}

export interface AdminOverviewResponse {
  ok?: boolean
  data?: {
    totalUsers: number
    totalImageDetect: number
    totalVideoDetect: number
    totalAnomalyImages: number
    totalAnomalyVideos: number
    userAnomalyRank: { userId: number; userName: string; anomalyCount: number }[]
    timeRangeData: {
      image: { total: number; anomaly: number }
      video: { total: number; anomaly: number }
    }
  }
  error?: boolean
  message?: string
}

export interface AnomalyDistributionResponse {
  ok?: boolean
  data?: {
    mediaType: string
    totalAnomalies: number
    distribution: { label: string; count: number; percentage: number }[]
    confidenceDistribution: { range: string; count: number }[]
  }
  error?: boolean
  message?: string
}

// 2.1 图片检测结果概览统计
export const getImageOverview = async (): Promise<ImageOverviewResponse> => {
  const response = await apiClient.get<ImageOverviewResponse>('/api/statistics/image-overview')
  return response.data
}

// 2.2 视频检测结果详情统计
export const getVideoDetail = async (videoId: number): Promise<VideoDetailResponse> => {
  const response = await apiClient.get<VideoDetailResponse>(
    `/api/statistics/video-detail/${videoId}`,
  )
  return response.data
}

// 2.3 全平台检测结果汇总
export const getAdminTotalOverview = async (params?: {
  startDate?: string
  endDate?: string
}): Promise<AdminOverviewResponse> => {
  const response = await apiClient.get<AdminOverviewResponse>(
    '/api/statistics/admin/total-overview',
    { params },
  )
  return response.data
}

// 2.4 异常类型分布统计
export const getAnomalyTypeDistribution = async (params?: {
  mediaType?: string
  startDate?: string
  endDate?: string
}): Promise<AnomalyDistributionResponse> => {
  const response = await apiClient.get<AnomalyDistributionResponse>(
    '/api/statistics/anomaly-type-distribution',
    { params },
  )
  return response.data
}
