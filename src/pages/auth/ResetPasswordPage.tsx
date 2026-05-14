import { App, Button, Card, Form, Input, Typography } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useResetPasswordByTokenMutation } from '@/features/auth/authApi'

const { Title, Text } = Typography

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const { message } = App.useApp()
  const [resetPassword, { isLoading }] = useResetPasswordByTokenMutation()

  const onFinish = async (values: { newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      void message.error('Mật khẩu xác nhận không khớp')
      return
    }
    try {
      await resetPassword({ token, ...values }).unwrap()
      void message.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.')
      navigate('/login', { replace: true })
    } catch (err: unknown) {
      const errMsg =
        typeof err === 'object' && err !== null && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined
      void message.error(errMsg ?? 'Token không hợp lệ hoặc đã hết hạn')
    }
  }

  if (!token) {
    return (
      <Card style={{ width: 400 }} styles={{ body: { padding: '40px 32px' } }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={4} style={{ color: '#ff4d4f' }}>
            Link không hợp lệ
          </Title>
          <Text type='secondary'>
            Link đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu lại.
          </Text>
        </div>
      </Card>
    )
  }

  return (
    <Card style={{ width: 400 }} styles={{ body: { padding: '40px 32px' } }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={3} style={{ margin: 0 }}>
          Đặt lại mật khẩu
        </Title>
        <Text type='secondary'>Nhập mật khẩu mới cho tài khoản của bạn</Text>
      </div>

      <Form layout='vertical' onFinish={onFinish} autoComplete='off' size='large'>
        <Form.Item
          name='newPassword'
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder='Mật khẩu mới' />
        </Form.Item>

        <Form.Item
          name='confirmPassword'
          rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }]}
          style={{ marginBottom: 24 }}
        >
          <Input.Password prefix={<LockOutlined />} placeholder='Xác nhận mật khẩu' />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type='primary' htmlType='submit' block loading={isLoading}>
            Xác nhận đặt lại mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default ResetPasswordPage
