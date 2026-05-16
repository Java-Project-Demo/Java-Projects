import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/config/axiosBaseQuery'
import type { ImportImeiRequest, Product, ProductItem } from '@/types/api'

export const stockApi = createApi({
  reducerPath: 'stockApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Stock'],
  endpoints: (builder) => ({
    importImei: builder.mutation<Product, ImportImeiRequest>({
      query: (data) => ({ url: '/stock/import', method: 'POST', data }),
      invalidatesTags: ['Stock'],
    }),
    exportImei: builder.mutation<ProductItem, { orderId: number; imei: string }>({
      query: ({ orderId, imei }) => ({
        url: '/stock/export',
        method: 'POST',
        params: { orderId, imei },
      }),
      invalidatesTags: ['Stock'],
    }),
    markDamaged: builder.mutation<void, { imei: string; reason: string }>({
      query: (data) => ({ url: '/stock/mark-damaged', method: 'POST', data }),
      invalidatesTags: ['Stock'],
    }),
    returnProduct: builder.mutation<void, { imei: string }>({
      query: (data) => ({ url: '/stock/return-product', method: 'POST', data }),
      invalidatesTags: ['Stock'],
    }),
  }),
})

export const {
  useImportImeiMutation,
  useExportImeiMutation,
  useMarkDamagedMutation,
  useReturnProductMutation,
} = stockApi
