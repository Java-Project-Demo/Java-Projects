import { App, Alert, Button, Card, Form, Input, Typography } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useChangePasswordMutation } from '@/features/auth/authApi'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearCredentials, clearMustChangePassword } from '@/features/auth/authSlice'

const { Title, Text } = Typography

interface FormValues {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

const ChangePasswordPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { message } = App.useApp()
  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const mustChange = useAppSelector((s) => s.auth.mustChangePassword)
  const user = useAppSelector((s) => s.auth.user)

  const onFinish = async (values: FormValues) => {
    if (values.newPassword !== values.confirmPassword) {
      void message.error('Mật khẩu xác nhận không khớp')
      return
    }
    try {
      await changePassword(values).unwrap()
      dispatch(clearMustChangePassword())
      void message.success('Đổi mật khẩu thành công')
      navigate('/', { replace: true })
    } catch {
      void message.error('Đổi mật khẩu thất bại — kiểm tra lại mật khẩu cũ')
    }
  }

  const handleLogout = () => {
    dispatch(clearCredentials())
    navigate('/login', { replace: true })
  }

  return (
    <Card style={{ width: 440 }} styles={{ body: { padding: '36px 32px' } }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Đổi mật khẩu
        </Title>
        <Text type='secondary'>Xin chào {user?.username}</Text>
      </div>

      {mustChange && (
        <Alert
          type='warning'
          showIcon
          style={{ marginBottom: 20 }}
          message='Tài khoản đang dùng mật khẩu tạm thời'
          description='Bạn phải đổi mật khẩu trước khi sử dụng hệ thống.'
        />
      )}

      <Form layout='vertical' onFinish={onFinish} autoComplete='off' size='large'>
        <Form.Item
          name='oldPassword'
          label='Mật khẩu hiện tại'
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder='Mật khẩu hiện tại' />
        </Form.Item>

        <Form.Item
          name='newPassword'
          label='Mật khẩu mới'
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder='Mật khẩu mới' />
        </Form.Item>

        <Form.Item
          name='confirmPassword'
          label='Xác nhận mật khẩu mới'
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) return Promise.resolve()
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp'))
              },
            }),
          ]}
          style={{ marginBottom: 24 }}
        >
          <Input.Password prefix={<LockOutlined />} placeholder='Nhập lại mật khẩu mới' />
        </Form.Item>

        <Form.Item style={{ marginBottom: 8 }}>
          <Button type='primary' htmlType='submit' block loading={isLoading}>
            Xác nhận đổi mật khẩu
          </Button>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type='link' block onClick={handleLogout}>
            Đăng xuất
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default ChangePasswordPage
