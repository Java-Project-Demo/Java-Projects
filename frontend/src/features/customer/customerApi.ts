import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/config/axiosBaseQuery'
import type { Customer } from '@/types/api'

export const customerApi = createApi({
  reducerPath: 'customerApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    lookupCustomer: builder.query<Customer, { phone?: string; email?: string }>({
      query: ({ phone, email }) => ({
        url: '/customer/lookup',
        method: 'GET',
        params: {
          ...(phone ? { phone } : {}),
          ...(email ? { email } : {}),
        },
      }),
    }),
  }),
})

export const { useLazyLookupCustomerQuery } = customerApi
