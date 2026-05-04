import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/config/axiosBaseQuery'
import type { Supplier, SupplierRequest, SupplierUpdateRequest } from '@/types/api'

export const supplierApi = createApi({
  reducerPath: 'supplierApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Supplier'],
  endpoints: (builder) => ({
    getSuppliers: builder.query<Supplier[], void>({
      query: () => ({ url: '/supplier/', method: 'GET' }),
      providesTags: ['Supplier'],
    }),
    getSupplier: builder.query<Supplier, number>({
      query: (id) => ({ url: `/supplier/${id}`, method: 'GET' }),
      providesTags: ['Supplier'],
    }),
    createSupplier: builder.mutation<Supplier, SupplierRequest>({
      query: (data) => ({ url: '/supplier/', method: 'POST', data }),
      invalidatesTags: ['Supplier'],
    }),
    updateSupplier: builder.mutation<Supplier, { id: number; data: SupplierUpdateRequest }>({
      query: ({ id, data }) => ({ url: `/supplier/${id}`, method: 'PUT', data }),
      invalidatesTags: ['Supplier'],
    }),
  }),
})

export const {
  useGetSuppliersQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
} = supplierApi
