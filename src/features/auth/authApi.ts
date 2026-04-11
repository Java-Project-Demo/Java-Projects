import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/config/axiosBaseQuery'
import type { LoginRequest, LoginResponse, UserProfile } from './types'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        data: credentials
      })
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST'
      })
    }),
    getMe: builder.query<UserProfile, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET'
      })
    })
  })
})

export const { useLoginMutation, useLogoutMutation, useGetMeQuery } = authApi
