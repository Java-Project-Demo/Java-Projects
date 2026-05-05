import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/config/axiosBaseQuery'
import type { Product, ProductRequest } from '@/types/api'

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => ({ url: '/product/', method: 'GET' }),
      providesTags: ['Product'],
    }),
    getProduct: builder.query<Product, number>({
      query: (id) => ({ url: `/product/${id}`, method: 'GET' }),
      providesTags: ['Product'],
    }),
    createProduct: builder.mutation<Product, ProductRequest>({
      query: (data) => ({ url: '/product/', method: 'POST', data }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<Product, { id: number; data: ProductRequest }>({
      query: ({ id, data }) => ({ url: `/product/${id}`, method: 'PUT', data }),
      invalidatesTags: ['Product'],
    }),
    setProductDeleted: builder.mutation<Product, { id: number; isDeleted: boolean; current: Product }>({
      query: ({ id, isDeleted, current }) => ({
        url: `/product/${id}`,
        method: 'PUT',
        data: {
          name: current.name,
          categoryId: current.categoryId,
          priceImport: current.priceImport,
          priceExport: current.priceExport,
          minThreshold: current.minThreshold,
          warrantyPeriod: current.warrantyPeriod ?? 12,
          status: current.status,
          specifications: current.specifications ?? '',
          isDeleted,
        },
      }),
      invalidatesTags: ['Product'],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useSetProductDeletedMutation,
} = productApi
