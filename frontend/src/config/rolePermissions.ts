export type URole = 'ADMIN' | 'STOCK' | 'SALES'

export const ALL_ROLES: URole[] = ['ADMIN', 'STOCK', 'SALES']

export const ROUTE_ROLES: Record<string, URole[]> = {
  '/': ALL_ROLES,
  '/vat-tu': ALL_ROLES,
  '/danh-muc-vat-tu': ALL_ROLES,
  '/nha-cung-cap': ALL_ROLES,
  '/nhap-kho': ['ADMIN', 'STOCK'],
  '/xuat-kho': ['ADMIN', 'SALES'],
  '/lich-su-don-hang': ALL_ROLES,
  '/tra-cuu-imei': ALL_ROLES,
  '/yeu-cau': ALL_ROLES,
  '/in-barcode': ALL_ROLES,
  '/quan-ly-kho': ['ADMIN', 'STOCK'],
  '/ton-kho-cu': ['ADMIN', 'STOCK'],
  '/thong-ke': ['ADMIN'],
  '/nhan-vien': ['ADMIN'],
  '/logs': ['ADMIN']
}

export const ACTION_ROLES = {
  PRODUCT_CREATE: ['ADMIN'] as URole[],
  PRODUCT_UPDATE: ['ADMIN'] as URole[],
  PRODUCT_DELETE: ['ADMIN'] as URole[],
  CATEGORY_CRUD: ['ADMIN'] as URole[],
  SUPPLIER_CRUD: ['ADMIN'] as URole[],
  STOCK_IMPORT: ['ADMIN', 'STOCK'] as URole[],
  STOCK_EXPORT: ['ADMIN', 'SALES'] as URole[],
  ORDER_CREATE: ['ADMIN', 'SALES'] as URole[],
  ORDER_CANCEL: ['ADMIN', 'SALES'] as URole[],
  ORDER_RETURN: ['ADMIN', 'SALES'] as URole[],
  WARRANTY_CREATE: ['ADMIN', 'SALES'] as URole[],
  WARRANTY_UPDATE: ['ADMIN', 'STOCK'] as URole[],
  WAREHOUSE_EDIT: ['ADMIN', 'STOCK'] as URole[],
  INVENTORY_SCAN: ['ADMIN', 'STOCK'] as URole[],
  USER_MANAGE: ['ADMIN'] as URole[],
  AUDIT_LOG_VIEW: ['ADMIN'] as URole[],
  REVENUE_VIEW: ['ADMIN'] as URole[],
  LOW_STOCK_VIEW: ['ADMIN', 'STOCK'] as URole[],
  TOP_SELLING_VIEW: ['ADMIN', 'SALES'] as URole[]
} as const

export type ActionKey = keyof typeof ACTION_ROLES
