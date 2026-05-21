import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/config/axiosBaseQuery'
import type { AiAgentRequest, ChatResponse } from '@/types/api'

export const aiAgentApi = createApi({
  reducerPath: 'aiAgentApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['AiAgent'],
  endpoints: (builder) => ({
    askAgent: builder.mutation<ChatResponse, AiAgentRequest>({
      query: (data) => ({ url: '/agent/chat', method: 'POST', data }),
      invalidatesTags: ['AiAgent']
    }),
    agentSuggest: builder.mutation<string, AiAgentRequest>({
      query: (data) => ({
        url: '/agent/suggest',
        method: 'POST',
        data
      }),
      invalidatesTags: ['AiAgent']
    })
  })
})

export const { useAskAgentMutation, useAgentSuggestMutation } = aiAgentApi
