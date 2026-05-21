import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import axiosInstance from './axios'

interface AxiosBaseQueryArgs {
  url: string
  method: AxiosRequestConfig['method']
  data?: AxiosRequestConfig['data']
  params?: AxiosRequestConfig['params']
  headers?: AxiosRequestConfig['headers']
}

interface AxiosBaseQueryError {
  status: number | undefined
  data: unknown
}

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> =>
  async ({ url, method, data, params, headers }) => {
    try {
      const config: AxiosRequestConfig = {
        url,
        method,
        data,
        params,
        headers: headers ? { ...headers } : undefined
      }

      if (data instanceof FormData) {
        config.headers = {
          ...config.headers,
          'Content-Type': undefined
        }
      }

      const result = await axiosInstance(config)
      return { data: result.data.data ?? result.data }
    } catch (axiosError) {
      const err = axiosError as AxiosError<{ message?: string }>
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data ?? err.message
        }
      }
    }
  }
