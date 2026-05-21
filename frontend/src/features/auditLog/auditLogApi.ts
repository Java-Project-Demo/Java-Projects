import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/config/axiosBaseQuery'
import type { AuditLog } from '@/types/api'

export interface AuditLogParams {
  userId?: string
  action?: string
  status?: string
  page?: number
  size?: number
}

export const auditLogApi = createApi({
  reducerPath: 'auditLogApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['AuditLog'],
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLog[], AuditLogParams>({
      query: ({ page = 0, size = 20, ...rest } = {}) => ({
        url: '/logs/',
        method: 'GET',
        params: { page, size, ...rest }
      }),
      providesTags: ['AuditLog']
    })
  })
})

export const { useGetAuditLogsQuery } = auditLogApi
