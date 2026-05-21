import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { App as AntApp, ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import enUS from 'antd/locale/en_US'
import type { Locale } from 'antd/es/locale'
import { useTranslation } from 'react-i18next'
import { store } from '@/app/store'
import { antdTheme } from '@/config/theme'
import AppRoutes from '@/routes'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import '@/i18n'
import './index.css'

const ANTD_LOCALES: Record<string, Locale> = { vi: viVN, en: enUS }

const LocalizedApp = () => {
  const { i18n } = useTranslation()
  const code = (i18n.resolvedLanguage ?? i18n.language ?? 'vi').slice(0, 2)
  const locale = ANTD_LOCALES[code] ?? viVN

  return (
    <ConfigProvider theme={antdTheme} locale={locale}>
      <AntApp>
        <BrowserRouter>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <LocalizedApp />
    </Provider>
  </StrictMode>
)
