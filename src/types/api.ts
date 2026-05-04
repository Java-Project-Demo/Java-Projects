export type ProductStatus = 'ACTIVE' | 'INACTIVE'
export type ItemStatus = 'AVAILABLE' | 'SOLD' | 'DAMAGED' | 'RETURNED'
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELED'
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD'
export type WarrantyStatus = 'RECEIVED' | 'FIXING' | 'FIXED' | 'RETURNED' | 'UNFIXABLE'
export type UserRole = 'ADMIN' | 'SALES' | 'STOCK'

export interface ProductItem {
  id: number
  productId?: number
  imei: string
  status: ItemStatus
  importDate: string | null
  soldDate: string | null
  warrantyExpiryDate?: string | null
  orderId?: number | null
}

export interface Product {
  id: number
  categoryId: number
  sku: string
  name: string
  priceImport: number
  priceExport: number
  currentStock: number
  minThreshold: number
  warrantyPeriod: number | null
  hasImei: boolean | null
  status: ProductStatus
  specifications: string | null
  isDeleted: boolean
  items: ProductItem[]
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  description: string | null
  items: Product[]
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  username: string
  fullName: string | null
  email: string | null
  role: string
  status: string | null
  gender: number | null
  dob: string | null
  phoneNumber: string | null
  isPasswordReset: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Supplier {
  id: number
  name: string
  contactPerson: string | null
  phoneNumber: string | null
  email: string | null
  address: string | null
  taxCode: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: number
  productId: number
  productName: string
  quantity: number
  unitPrice: number
}

export interface OrderResponse {
  id: number
  customerId: number
  customerName: string
  customerPhone: string
  totalAmount: number
  paymentMethod: PaymentMethod
  status: OrderStatus
  createdAt: string
  items?: OrderItem[]
}

export interface WarrantyResponse {
  id: number
  productItemId: number
  customerId: number | null
  createdBy: number
  issueDescription: string
  status: WarrantyStatus
  receivedDate: string
  returnDate: string | null
  technicalNote?: string
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: number
  userId: number
  action: string
  entityName: string
  entityId: string
  status: string
  details: string
  createdAt: string
  updatedAt: string
}

export interface DashboardSummary {
  totalInventoryValue: number
  totalProducts: number
  lowStockCount: number
  pendingOrders: number
  todayRevenue: number
  todayProfit: number
  activeWarrantyClaims: number
  recentActivities: AuditLog[]
}

export interface Pagination {
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
}

export interface ResponsePage<T> {
  content: T[]
  pagination: Pagination
}

// ─── Requests ────────────────────────────────────────────────────────────────

export interface ProductRequest {
  sku: string
  categoryId: number
  name: string
  priceImport: number
  priceExport: number
  hasImei: boolean
  currentStock: number
  warrantyPeriod: number
  minThreshold: number
  specifications?: string
  status: ProductStatus
}

export interface CategoryRequest {
  name: string
  description?: string
}

export interface SupplierRequest {
  name: string
  contactPerson?: string
  phoneNumber?: string
  email?: string
  address?: string
  taxCode?: string
}

export type SupplierUpdateRequest = Partial<SupplierRequest>

export interface ImportImeiRequest {
  productId: number
  costPrice: number
  supplier: string
  imeiList: string[]
}

export interface CartItem {
  productId: number
  quantity: number
  selectImeis: string[]
}

export interface OrderRequest {
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerAddress?: string
  paymentMethod: PaymentMethod
  items: CartItem[]
}

export interface RegisterRequest {
  fullName: string
  roleName: string
  status: string
}

export interface UpdateInfoRequest {
  fullName?: string
  gender?: number
  dob?: string
  phoneNumber?: string
}

export interface CreateWarrantyRequest {
  imeis: string[]
  issue: string
}

export interface UpdateWarrantyRequest {
  claimId: number
  status: WarrantyStatus
  technicalNote?: string
}
