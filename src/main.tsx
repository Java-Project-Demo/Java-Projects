import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { App as AntApp, ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { store } from '@/app/store'
import { antdTheme } from '@/config/theme'
import AppRoutes from '@/routes'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ConfigProvider theme={antdTheme} locale={viVN}>
        <AntApp>
          <BrowserRouter>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </Provider>
  </StrictMode>,
)
