import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { Button, Result } from 'antd'

interface Props { children: ReactNode }
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
    if (this.state.hasError) {
      return (
        <Result
          status='error'
          title='Đã xảy ra lỗi'
          subTitle={this.state.message || 'Vui lòng thử tải lại trang.'}
          extra={
            <Button type='primary' onClick={() => window.location.reload()}>
              Tải lại trang
            </Button>
          }
        />
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
