import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/config/axiosBaseQuery'
import type { OrderRequest, OrderResponse, ResponsePage } from '@/types/api'

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    getOrders: builder.query<ResponsePage<OrderResponse>, { page?: number; size?: number; status?: string }>({
      query: ({ page = 0, size = 20, status } = {}) => ({
        url: '/order/',
        method: 'GET',
        params: { page, size, ...(status ? { status } : {}) },
      }),
      providesTags: ['Order'],
    }),
    getOrder: builder.query<OrderResponse, number>({
      query: (id) => ({ url: `/order/${id}`, method: 'GET' }),
      providesTags: ['Order'],
    }),
    createOrder: builder.mutation<OrderResponse, OrderRequest>({
      query: (data) => ({ url: '/order/create', method: 'POST', data }),
      invalidatesTags: ['Order'],
    }),
    cancelOrder: builder.mutation<OrderResponse, number>({
      query: (id) => ({ url: `/order/cancel/${id}`, method: 'POST' }),
      invalidatesTags: ['Order'],
    }),
    returnOrder: builder.mutation<string, { id: number; imeis: string[]; reason: string }>({
      query: ({ id, imeis, reason }) => ({
        url: `/order/return/${id}`,
        method: 'POST',
        data: { imeis, reason },
      }),
      invalidatesTags: ['Order'],
    }),
  }),
})

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
  useReturnOrderMutation,
} = orderApi
