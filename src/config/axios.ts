import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL ?? 'http://localhost:8888/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
})

// Queue các request bị lỗi 401 trong khi đang refresh token
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
}> = []

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(undefined)
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err: unknown) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await axiosInstance.post('/auth/refresh')
        processQueue(null)
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as AxiosError)
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
