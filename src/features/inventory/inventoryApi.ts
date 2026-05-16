import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/config/axiosBaseQuery'
import type { InventorySessionResponse, ScanResultResponse, SessionSummaryResponse } from '@/types/api'

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Inventory'],
  endpoints: (builder) => ({
    startSession: builder.mutation<InventorySessionResponse, { warehouseId: number }>({
      query: (data) => ({ url: '/inventory/start', method: 'POST', data }),
      invalidatesTags: ['Inventory'],
    }),
    recordScan: builder.mutation<ScanResultResponse, { sessionId: number; imei: string; actualLocId: number }>({
      query: ({ sessionId, imei, actualLocId }) => ({
        url: '/inventory/scan',
        method: 'POST',
        params: { sessionId, imei, actualLocId },
      }),
      invalidatesTags: ['Inventory'],
    }),
    completeSession: builder.mutation<SessionSummaryResponse, number>({
      query: (sessionId) => ({
        url: '/inventory/complete',
        method: 'POST',
        params: { sessionId },
      }),
      invalidatesTags: ['Inventory'],
    }),
    getSummary: builder.query<SessionSummaryResponse, number>({
      query: (sessionId) => ({ url: `/inventory/${sessionId}/summary`, method: 'GET' }),
      providesTags: ['Inventory'],
    }),
  }),
})

export const {
  useStartSessionMutation,
  useRecordScanMutation,
  useCompleteSessionMutation,
  useGetSummaryQuery,
} = inventoryApi
