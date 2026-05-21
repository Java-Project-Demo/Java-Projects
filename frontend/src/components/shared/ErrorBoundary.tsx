import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { Button, Result } from 'antd'
import { withTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'

interface Props { children: ReactNode; t: TFunction }
interface State { hasError: boolean; message: string }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    const { t } = this.props
    if (this.state.hasError) {
      return (
        <Result
          status='error'
          title={t('error.title')}
          subTitle={this.state.message || t('error.reloadHint')}
          extra={
            <Button type='primary' onClick={() => window.location.reload()}>
              {t('error.reload')}
            </Button>
          }
        />
      )
    }
    return this.props.children
  }
}

export default withTranslation('common')(ErrorBoundary)
