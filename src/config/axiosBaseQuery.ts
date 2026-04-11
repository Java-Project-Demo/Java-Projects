import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import axiosInstance from './axios'

interface AxiosBaseQueryArgs {
  url: string
  method: AxiosRequestConfig['method']
  data?: AxiosRequestConfig['data']
  params?: AxiosRequestConfig['params']
}

interface AxiosBaseQueryError {
  status: number | undefined
  data: unknown
}

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> =>
  async ({ url, method, data, params }) => {
    try {
      const result = await axiosInstance({ url, method, data, params })
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
