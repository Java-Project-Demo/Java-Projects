import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/config/axiosBaseQuery'
import type { Category, CategoryRequest } from '@/types/api'

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => ({ url: '/category/', method: 'GET' }),
      providesTags: ['Category'],
    }),
    getCategory: builder.query<Category, number>({
      query: (id) => ({ url: `/category/${id}`, method: 'GET' }),
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation<Category, CategoryRequest>({
      query: (data) => ({ url: '/category/', method: 'POST', data }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<Category, { id: number; data: CategoryRequest }>({
      query: ({ id, data }) => ({ url: `/category/${id}`, method: 'PUT', data }),
      invalidatesTags: ['Category'],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} = categoryApi
