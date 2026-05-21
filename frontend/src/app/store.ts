import { configureStore } from '@reduxjs/toolkit'
import { authApi } from '@/features/auth/authApi'
import { dashboardApi } from '@/features/dashboard/dashboardApi'
import { productApi } from '@/features/product/productApi'
import { categoryApi } from '@/features/category/categoryApi'
import { orderApi } from '@/features/order/orderApi'
import { customerApi } from '@/features/customer/customerApi'
import { stockApi } from '@/features/stock/stockApi'
import { supplierApi } from '@/features/supplier/supplierApi'
import { userApi } from '@/features/user/userApi'
import { warrantyApi } from '@/features/warranty/warrantyApi'
import { auditLogApi } from '@/features/auditLog/auditLogApi'
import authReducer from '@/features/auth/authSlice'
import { aiAgentApi } from '@/features/aiAgent/aiAgentApi.ts'
import { inventoryApi } from '@/features/inventory/inventoryApi'
import { warehouseApi } from '@/features/warehouse/warehouseApi'
import { systemApi } from '@/features/system/systemApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [stockApi.reducerPath]: stockApi.reducer,
    [supplierApi.reducerPath]: supplierApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [warrantyApi.reducerPath]: warrantyApi.reducer,
    [auditLogApi.reducerPath]: auditLogApi.reducer,
    [aiAgentApi.reducerPath]: aiAgentApi.reducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
    [warehouseApi.reducerPath]: warehouseApi.reducer,
    [systemApi.reducerPath]: systemApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(dashboardApi.middleware)
      .concat(productApi.middleware)
      .concat(categoryApi.middleware)
      .concat(orderApi.middleware)
      .concat(customerApi.middleware)
      .concat(stockApi.middleware)
      .concat(supplierApi.middleware)
      .concat(userApi.middleware)
      .concat(warrantyApi.middleware)
      .concat(auditLogApi.middleware)
      .concat(aiAgentApi.middleware)
      .concat(inventoryApi.middleware)
      .concat(warehouseApi.middleware)
      .concat(systemApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
