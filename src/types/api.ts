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
  imageUrl: string
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
  isDeleted?: boolean
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

export interface CreatedUser extends User {
  tempPassword?: string
}

export interface Supplier {
  id: number
  name: string
  contactPerson: string | null
  phoneNumber: string | null
  email: string | null
  address: string | null
  taxCode: string | null
  isDeleted?: boolean
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: number
  phoneNumber: string | null
  fullName: string | null
  email: string | null
  address: string | null
}

export interface OrderItem {
  id: number
  productId: number
  productName: string | null
  productSku?: string | null
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
  imei: string | null
  productName: string | null
  customerName: string | null
  customerPhone: string | null
  issueDescription: string
  staffName: string | null
  staffUsername: string | null
  status: WarrantyStatus
  receivedDate: string
  returnDate: string | null
  technicalNote?: string
}

export interface AuditLog {
  id: number
  userId: number
  action: string
  entityName: string
  entityId: string
  status: string
  details: string
  staffName?: string | null
  staffUsername?: string | null
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
  imageUrl: string
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

export type SupplierUpdateRequest = Partial<SupplierRequest> & {
  isDeleted?: boolean
}

export interface ImportImeiRequest {
  productId: number
  locationId: number
  supplierId: number
  costPrice: number
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
  email?: string
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

export interface AiAgentRequest {
  message: string
}

// ─── Warehouse / Inventory ────────────────────────────────────────────────────

export interface LocationItemMini {
  id: number
  productId: number
  productName: string | null
  productSku: string | null
  imei: string
  status: ItemStatus
}

export interface WarehouseLocationResponse {
  id: number
  warehouseId: number
  zoneName: string | null
  rowNum: string | null
  shelfNum: string | null
  binNum: string | null
  items: LocationItemMini[]
}

export interface WarehouseResponse {
  id: number
  name: string
  address: string | null
  locations: WarehouseLocationResponse[]
  createdAt: string
  updatedAt: string
}

export interface WarehouseRequest {
  name: string
  address?: string
}

export interface SetupLayoutRequest {
  warehouseId: number
  zone: string
  row: string
  shelfCount: number
  binCount: number
}

export type DetailStatus = 'MATCH' | 'MISMATCH' | 'MISSING' | 'EXTRA'

export interface InventorySessionResponse {
  id: number
  warehouseId: number | null
  warehouseName: string | null
  warehouseAddress: string | null
  createdBy: number
  createdByUsername: string | null
  status: 'IN_PROGRESS' | 'COMPLETED'
  startDate: string
  endDate: string | null
}

export interface ScanResultResponse {
  detailId: number
  imei: string
  status: DetailStatus
  expectedLocId: number | null
  expectedLocLabel: string | null
  actualLocId: number | null
  actualLocLabel: string | null
  note?: string | null
}

export interface SessionSummaryResponse {
  session: InventorySessionResponse
  matchCount: number
  mismatchCount: number
  missingCount: number
  extraCount: number
  details: ScanResultResponse[]
}
