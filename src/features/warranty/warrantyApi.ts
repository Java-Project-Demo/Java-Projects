import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/config/axiosBaseQuery'
import type { CreateWarrantyRequest, UpdateWarrantyRequest } from '@/types/api'

export const warrantyApi = createApi({
  reducerPath: 'warrantyApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Warranty'],
  endpoints: (builder) => ({
    createWarranty: builder.mutation<unknown[], CreateWarrantyRequest>({
      query: (data) => ({ url: '/warranty/create', method: 'POST', data }),
      invalidatesTags: ['Warranty'],
    }),
    updateWarranty: builder.mutation<unknown, UpdateWarrantyRequest>({
      query: (data) => ({ url: '/warranty/update', method: 'PUT', data }),
      invalidatesTags: ['Warranty'],
    }),
  }),
})

export const { useCreateWarrantyMutation, useUpdateWarrantyMutation } = warrantyApi
