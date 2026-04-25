import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/config/axiosBaseQuery'
import type { ImportImeiRequest, Product, ProductItem } from '@/types/api'

export const warehouseApi = createApi({
  reducerPath: 'warehouseApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Warehouse'],
  endpoints: (builder) => ({
    importImei: builder.mutation<Product, ImportImeiRequest>({
      query: (data) => ({ url: '/warehouse/import', method: 'POST', data }),
      invalidatesTags: ['Warehouse'],
    }),
    exportImei: builder.mutation<ProductItem, { orderId: number; imei: string }>({
      query: ({ orderId, imei }) => ({
        url: '/warehouse/export',
        method: 'POST',
        params: { orderId, imei },
      }),
      invalidatesTags: ['Warehouse'],
    }),
  }),
})

export const { useImportImeiMutation, useExportImeiMutation } = warehouseApi
