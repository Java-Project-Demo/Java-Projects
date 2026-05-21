import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/config/axiosBaseQuery'

export const systemApi = createApi({
  reducerPath: 'systemApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    uploadImage: builder.mutation<string, FormData>({
      query: (data) => ({
        url: '/cloudinary/upload',
        method: 'POST',
        data,
      }),
      transformResponse: (response: { secure_url: string }) => response.secure_url,
    }),
  }),
})

export const { useUploadImageMutation } = systemApi
