import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/config/axiosBaseQuery'
import type { DashboardSummary, Product, ProductItem } from '@/types/api'

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Dashboard'],
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => ({ url: '/dashboard/summary', method: 'GET' }),
      providesTags: ['Dashboard'],
    }),
    getLowStock: builder.query<Product[], void>({
      query: () => ({ url: '/dashboard/low-stock', method: 'GET' }),
      providesTags: ['Dashboard'],
    }),
    traceImei: builder.query<Record<string, unknown>, string>({
      query: (imei) => ({ url: '/dashboard/trace', method: 'GET', params: { imei } }),
    }),
    getAgingReport: builder.query<ProductItem[], { daysThreshold: number }>({
      query: ({ daysThreshold }) => ({
        url: '/dashboard/aging-report',
        method: 'GET',
        params: { daysThreshold },
      }),
    }),
  }),
})

export const {
  useGetDashboardSummaryQuery,
  useGetLowStockQuery,
  useTraceImeiQuery,
  useLazyTraceImeiQuery,
  useGetAgingReportQuery,
  useLazyGetAgingReportQuery,
} = dashboardApi
