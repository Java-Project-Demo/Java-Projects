import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/config/axiosBaseQuery'
import type { User, CreatedUser, RegisterRequest, UpdateInfoRequest, ResponsePage } from '@/types/api'

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<ResponsePage<User>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 } = {}) => ({
        url: '/user/',
        method: 'GET',
        params: { page, size },
      }),
      providesTags: ['User'],
    }),
    getUser: builder.query<User, number>({
      query: (id) => ({ url: `/user/${id}`, method: 'GET' }),
      providesTags: ['User'],
    }),
    createUser: builder.mutation<CreatedUser, RegisterRequest>({
      query: (data) => ({ url: '/user/', method: 'POST', data }),
      invalidatesTags: ['User'],
    }),
    updateUserInfo: builder.mutation<User, { id: number; data: UpdateInfoRequest }>({
      query: ({ id, data }) => ({ url: `/user/${id}/info`, method: 'PUT', data }),
      invalidatesTags: ['User'],
    }),
    updateUserStatus: builder.mutation<User, { id: number; active: boolean }>({
      query: ({ id, active }) => ({ url: `/user/${id}/status`, method: 'PUT', data: active }),
      invalidatesTags: ['User'],
    }),
    updateUserRole: builder.mutation<User, { id: number; roleName: string }>({
      query: ({ id, roleName }) => ({ url: `/user/${id}/role`, method: 'PUT', data: roleName }),
      invalidatesTags: ['User'],
    }),
    resetPassword: builder.mutation<string, number>({
      query: (id) => ({ url: `/auth/${id}/reset-password`, method: 'PUT' }),
    }),
  }),
})

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserInfoMutation,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useResetPasswordMutation,
} = userApi
