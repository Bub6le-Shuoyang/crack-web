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

// ========== 新增的6个统计接口 ==========

export interface StorageStatsResponse {
  ok?: boolean
  data?: {
    totalStorage: number
    totalStorageFormatted: string
    imageStorage: number
    imageStorageFormatted: string
    videoStorage: number
    videoStorageFormatted: string
    imageCount: number
    videoCount: number
    imageStoragePercent: number
    videoStoragePercent: number
    storageByUser?: {
      userId: number
      userName: string
      storage: number
      storageFormatted: string
      percentage: number
    }[]
    storageTrend: {
      date: string
      total: number
      dailyNew: number
    }[]
  }
  error?: boolean
  message?: string
}

export interface PersonalStatsResponse {
  ok?: boolean
  data?: {
    totalImages: number
    totalVideos: number
    totalStorage: number
    totalStorageFormatted: string
    totalDetections: number
    detectedImages: number
    detectedVideos: number
    anomalyCount: number
    anomalyImages: number
    anomalyVideos: number
    anomalyRate: number
    recentActivity: {
      date: string
      uploads: number
      detections: number
    }[]
  }
  error?: boolean
  message?: string
}

export interface VideoOverviewResponse {
  ok?: boolean
  data?: {
    totalVideos: number
    totalDuration: number
    totalDurationFormatted: string
    detectedVideos: number
    anomalyVideos: number
    anomalyVideoRate: number
    avgAnomalyTimeRatio: number
    topAnomalyTypes: {
      label: string
      count: number
      percentage: number
    }[]
    dailyTrend: {
      date: string
      total: number
      anomaly: number
    }[]
  }
  error?: boolean
  message?: string
}

export interface FileTypeDistributionResponse {
  ok?: boolean
  data?: {
    imageTypes: {
      type: string
      count: number
      percentage: number
      totalSize: number
      totalSizeFormatted: string
    }[]
    videoTypes: {
      type: string
      count: number
      percentage: number
      totalSize: number
      totalSizeFormatted: string
    }[]
    totalFiles: number
    totalImages: number
    totalVideos: number
    totalStorage: number
    totalStorageFormatted: string
    totalImageSize: number
    totalImageSizeFormatted: string
    totalVideoSize: number
    totalVideoSizeFormatted: string
  }
  error?: boolean
  message?: string
}

export interface RealtimeDashboardResponse {
  ok?: boolean
  data?: {
    newUsersToday: number
    activeUsersToday: number
    imagesUploadedToday: number
    videosUploadedToday: number
    imagesDetectedToday: number
    videosDetectedToday: number
    anomaliesToday: number
    storageIncreaseToday: number
    storageIncreaseTodayFormatted: string
    timestamp: string
    hourlyTrend: {
      hour: number
      uploads: number
      detections: number
    }[]
  }
  error?: boolean
  message?: string
}

export interface AnomalyTimeAnalysisResponse {
  ok?: boolean
  data?: {
    hourlyDistribution: {
      hour: number
      hourLabel: string
      uploads: number
      anomalies: number
      anomalyRate: number
    }[]
    peakAnomalyHour: number
    peakAnomalyHourLabel: string
    peakAnomalyRate: number
    weekdayDistribution: {
      weekday: number
      weekdayName: string
      uploads: number
      anomalies: number
      anomalyRate: number
    }[]
  }
  error?: boolean
  message?: string
}

// 3.1 存储空间统计
export const getStorageStats = async (): Promise<StorageStatsResponse> => {
  const response = await apiClient.get<StorageStatsResponse>('/api/statistics/storage-stats')
  return response.data
}

// 3.2 用户个人统计
export const getPersonalStats = async (): Promise<PersonalStatsResponse> => {
  const response = await apiClient.get<PersonalStatsResponse>('/api/statistics/user/personal')
  return response.data
}

// 3.3 视频检测概览
export const getVideoOverview = async (): Promise<VideoOverviewResponse> => {
  const response = await apiClient.get<VideoOverviewResponse>('/api/statistics/video-overview')
  return response.data
}

// 3.4 文件类型分布
export const getFileTypeDistribution = async (): Promise<FileTypeDistributionResponse> => {
  const response = await apiClient.get<FileTypeDistributionResponse>(
    '/api/statistics/file-type-distribution',
  )
  return response.data
}

// 3.5 实时监控面板（管理员）
export const getRealtimeDashboard = async (): Promise<RealtimeDashboardResponse> => {
  const response = await apiClient.get<RealtimeDashboardResponse>(
    '/api/statistics/admin/realtime',
  )
  return response.data
}

// 3.6 异常热点时段分析
export const getAnomalyTimeAnalysis = async (): Promise<AnomalyTimeAnalysisResponse> => {
  const response = await apiClient.get<AnomalyTimeAnalysisResponse>(
    '/api/statistics/anomaly-time-analysis',
  )
  return response.data
}
