import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import 'dayjs/locale/en'

import viCommon from './locales/vi/common.json'
import viMenu from './locales/vi/menu.json'
import viAuth from './locales/vi/auth.json'
import viHome from './locales/vi/home.json'
import viStatistics from './locales/vi/statistics.json'
import viAuditLog from './locales/vi/auditLog.json'
import viOldStock from './locales/vi/oldStock.json'
import viProduct from './locales/vi/product.json'
import viStock from './locales/vi/stock.json'
import viOrder from './locales/vi/order.json'
import viWarranty from './locales/vi/warranty.json'
import viImei from './locales/vi/imei.json'
import viSupplier from './locales/vi/supplier.json'
import viEmployee from './locales/vi/employee.json'
import viInventory from './locales/vi/inventory.json'
import viWarehouse from './locales/vi/warehouse.json'
import viChat from './locales/vi/chat.json'

import enCommon from './locales/en/common.json'
import enMenu from './locales/en/menu.json'
import enAuth from './locales/en/auth.json'
import enHome from './locales/en/home.json'
import enStatistics from './locales/en/statistics.json'
import enAuditLog from './locales/en/auditLog.json'
import enOldStock from './locales/en/oldStock.json'
import enProduct from './locales/en/product.json'
import enStock from './locales/en/stock.json'
import enOrder from './locales/en/order.json'
import enWarranty from './locales/en/warranty.json'
import enImei from './locales/en/imei.json'
import enSupplier from './locales/en/supplier.json'
import enEmployee from './locales/en/employee.json'
import enInventory from './locales/en/inventory.json'
import enWarehouse from './locales/en/warehouse.json'
import enChat from './locales/en/chat.json'

export const LANGUAGE_KEY = 'dawn_language'
export const DEFAULT_LANGUAGE = 'vi'

export const resources = {
  vi: {
    common: viCommon,
    menu: viMenu,
    auth: viAuth,
    home: viHome,
    statistics: viStatistics,
    auditLog: viAuditLog,
    oldStock: viOldStock,
    product: viProduct,
    stock: viStock,
    order: viOrder,
    warranty: viWarranty,
    imei: viImei,
    supplier: viSupplier,
    employee: viEmployee,
    inventory: viInventory,
    warehouse: viWarehouse,
    chat: viChat
  },
  en: {
    common: enCommon,
    menu: enMenu,
    auth: enAuth,
    home: enHome,
    statistics: enStatistics,
    auditLog: enAuditLog,
    oldStock: enOldStock,
    product: enProduct,
    stock: enStock,
    order: enOrder,
    warranty: enWarranty,
    imei: enImei,
    supplier: enSupplier,
    employee: enEmployee,
    inventory: enInventory,
    warehouse: enWarehouse,
    chat: enChat
  }
} as const

export type SupportedLanguage = keyof typeof resources

const NAMESPACES = Object.keys(resources.vi) as Array<keyof (typeof resources)['vi']>

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: ['vi', 'en'],
    ns: NAMESPACES,
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_KEY,
      caches: ['localStorage']
    }
  })

const syncDayjs = (lng?: string) => {
  const code = (lng ?? DEFAULT_LANGUAGE).slice(0, 2)
  dayjs.locale(code === 'en' ? 'en' : 'vi')
}
syncDayjs(i18n.resolvedLanguage ?? i18n.language)
i18n.on('languageChanged', syncDayjs)

export default i18n
