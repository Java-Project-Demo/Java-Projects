import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

export const TOKEN_KEY = 'dawn_jwt'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL ?? 'http://localhost:8888/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

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
        const res = await axiosInstance.post<{ data: { accessToken: string } }>('/auth/refresh-token')
        const newToken = res.data?.data?.accessToken
        if (!newToken) throw new Error('No token in refresh response')
        localStorage.setItem(TOKEN_KEY, newToken)
        processQueue(null)
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as AxiosError)
        localStorage.removeItem(TOKEN_KEY)
        // Avoid redirect loop if already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
