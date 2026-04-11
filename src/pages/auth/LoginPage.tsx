import { App, Button, Card, Form, Input, Typography } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useLoginMutation } from '@/features/auth/authApi'
import { setCredentials } from '@/features/auth/authSlice'
import { useAppDispatch } from '@/app/hooks'
import type { LoginRequest } from '@/features/auth/types'

const { Title, Text } = Typography

const LoginPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { message } = App.useApp()
  const [login, { isLoading }] = useLoginMutation()

  const onFinish = async (values: LoginRequest) => {
    try {
      const result = await login(values).unwrap()
      dispatch(setCredentials(result.user))
      void message.success('Đăng nhập thành công!')
      navigate('/', { replace: true })
    } catch {
      void message.error('Tài khoản hoặc mật khẩu không đúng')
    }
  }

  return (
    <Card style={{ width: 400 }} styles={{ body: { padding: '40px 32px' } }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={3} style={{ margin: 0 }}>
          UTC System
        </Title>
        <Text type='secondary'>Đăng nhập để tiếp tục</Text>
      </div>

      <Form layout='vertical' onFinish={onFinish} autoComplete='off' size='large'>
        <Form.Item name='username' rules={[{ required: true, message: 'Vui lòng nhập tài khoản' }]}>
          <Input prefix={<UserOutlined />} placeholder='Tài khoản' />
        </Form.Item>

        <Form.Item
          name='password'
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          style={{ marginBottom: 24 }}
        >
          <Input.Password prefix={<LockOutlined />} placeholder='Mật khẩu' />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type='primary' htmlType='submit' block loading={isLoading}>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default LoginPage
