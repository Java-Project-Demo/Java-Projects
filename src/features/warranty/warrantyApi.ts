import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/config/axiosBaseQuery'
import type { CreateWarrantyRequest, UpdateWarrantyRequest, WarrantyResponse } from '@/types/api'

export const warrantyApi = createApi({
  reducerPath: 'warrantyApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Warranty'],
  endpoints: (builder) => ({
    getWarranties: builder.query<WarrantyResponse[], void>({
      query: () => ({ url: '/warranty/', method: 'GET' }),
      providesTags: ['Warranty'],
    }),
    getWarranty: builder.query<WarrantyResponse, number>({
      query: (id) => ({ url: `/warranty/${id}`, method: 'GET' }),
      providesTags: ['Warranty'],
    }),
    createWarranty: builder.mutation<WarrantyResponse[], CreateWarrantyRequest>({
      query: (data) => ({ url: '/warranty/create', method: 'POST', data }),
      invalidatesTags: ['Warranty'],
    }),
    updateWarranty: builder.mutation<WarrantyResponse, UpdateWarrantyRequest>({
      query: (data) => ({ url: '/warranty/update', method: 'PUT', data }),
      invalidatesTags: ['Warranty'],
    }),
  }),
})

export const {
  useGetWarrantiesQuery,
  useGetWarrantyQuery,
  useCreateWarrantyMutation,
  useUpdateWarrantyMutation,
} = warrantyApi
