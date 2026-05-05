import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/config/axiosBaseQuery'

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Inventory'],
  endpoints: (builder) => ({
    startSession: builder.mutation<number, void>({
      query: () => ({ url: '/inventory/start', method: 'POST' }),
      invalidatesTags: ['Inventory'],
    }),
    recordScan: builder.mutation<string, { sessionId: number; imei: string; actualLocId: number }>({
      query: ({ sessionId, imei, actualLocId }) => ({
        url: '/inventory/scan',
        method: 'POST',
        params: { sessionId, imei, actualLocId },
      }),
      invalidatesTags: ['Inventory'],
    }),
    completeSession: builder.mutation<string, number>({
      query: (sessionId) => ({
        url: '/inventory/complete',
        method: 'POST',
        params: { sessionId },
      }),
      invalidatesTags: ['Inventory'],
    }),
  }),
})

export const {
  useStartSessionMutation,
  useRecordScanMutation,
  useCompleteSessionMutation,
} = inventoryApi
