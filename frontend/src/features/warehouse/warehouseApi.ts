import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/config/axiosBaseQuery'
import type { WarehouseRequest, WarehouseResponse, WarehouseLocationResponse, SetupLayoutRequest } from '@/types/api'

export const warehouseApi = createApi({
  reducerPath: 'warehouseApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Warehouse', 'WarehouseLocation'],
  endpoints: (builder) => ({
    getMap: builder.query<WarehouseResponse[], void>({
      query: () => ({ url: '/warehouse/map', method: 'GET' }),
      providesTags: ['Warehouse', 'WarehouseLocation']
    }),
    getAvailableBins: builder.query<WarehouseLocationResponse[], { warehouseId: number; productId: number }>({
      query: ({ warehouseId, productId }) => ({
        url: '/warehouse/available-bins',
        method: 'GET',
        params: { warehouseId, productId }
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'WarehouseLocation' as const, id })),
              { type: 'WarehouseLocation', id: 'LIST' }
            ]
          : [{ type: 'WarehouseLocation', id: 'LIST' }]
    }),
    createWarehouse: builder.mutation<WarehouseResponse, WarehouseRequest>({
      query: (data) => ({ url: '/warehouse/create', method: 'POST', data }),
      invalidatesTags: ['Warehouse']
    }),
    setupLayout: builder.mutation<string, SetupLayoutRequest>({
      query: ({ warehouseId, zone, row, shelfCount, binCount }) => ({
        url: '/warehouse/setup-layout',
        method: 'POST',
        params: { warehouseId, zone, row, shelfCount, binCount }
      }),
      invalidatesTags: ['Warehouse', 'WarehouseLocation']
    }),
    moveItem: builder.mutation<string, { imei: string; targetLocId: number }>({
      query: ({ imei, targetLocId }) => ({
        url: '/warehouse/move-item',
        method: 'POST',
        params: { imei, targetLocId }
      }),
      invalidatesTags: ['WarehouseLocation']
    })
  })
})

export const {
  useGetMapQuery,
  useGetAvailableBinsQuery,
  useCreateWarehouseMutation,
  useSetupLayoutMutation,
  useMoveItemMutation
} = warehouseApi
