import { configureStore } from '@reduxjs/toolkit'
import { authApi } from '@/features/auth/authApi'
import { dashboardApi } from '@/features/dashboard/dashboardApi'
import { productApi } from '@/features/product/productApi'
import { categoryApi } from '@/features/category/categoryApi'
import { orderApi } from '@/features/order/orderApi'
import { warehouseApi } from '@/features/warehouse/warehouseApi'
import { userApi } from '@/features/user/userApi'
import { warrantyApi } from '@/features/warranty/warrantyApi'
import { auditLogApi } from '@/features/auditLog/auditLogApi'
import authReducer from '@/features/auth/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [warehouseApi.reducerPath]: warehouseApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [warrantyApi.reducerPath]: warrantyApi.reducer,
    [auditLogApi.reducerPath]: auditLogApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(dashboardApi.middleware)
      .concat(productApi.middleware)
      .concat(categoryApi.middleware)
      .concat(orderApi.middleware)
      .concat(warehouseApi.middleware)
      .concat(userApi.middleware)
      .concat(warrantyApi.middleware)
      .concat(auditLogApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
