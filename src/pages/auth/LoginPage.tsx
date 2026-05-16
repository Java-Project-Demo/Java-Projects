import { App, Button, Card, Form, Input, Typography } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLoginMutation } from '@/features/auth/authApi'
import { setCredentials } from '@/features/auth/authSlice'
import { useAppDispatch } from '@/app/hooks'
import { TOKEN_KEY } from '@/config/axios'
import { decodeJwt } from '@/features/auth/types'
import type { LoginRequest } from '@/features/auth/types'

const { Title, Text } = Typography

const LoginPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { message } = App.useApp()
  const { t } = useTranslation('auth')
  const [login, { isLoading }] = useLoginMutation()

  const onFinish = async (values: LoginRequest) => {
    try {
      const result = await login(values).unwrap()
      localStorage.setItem(TOKEN_KEY, result.accessToken)
      const profile = decodeJwt(result.accessToken) ?? { id: result.userId, username: result.username, role: '' }
      dispatch(setCredentials({ user: profile, mustChangePassword: !!result.isPasswordReset }))
      if (result.isPasswordReset) {
        void message.warning(t('login.tempWarning'))
        navigate('/change-password', { replace: true })
      } else {
        void message.success(t('login.success'))
        navigate('/', { replace: true })
      }
    } catch {
      void message.error(t('login.fail'))
    }
  }

  return (
    <Card style={{ width: 400 }} styles={{ body: { padding: '40px 32px' } }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={3} style={{ margin: 0 }}>
          {t('login.brand')}
        </Title>
        <Text type='secondary'>{t('login.subtitle')}</Text>
      </div>

      <Form layout='vertical' onFinish={onFinish} autoComplete='off' size='large'>
        <Form.Item name='username' rules={[{ required: true, message: t('login.usernameRequired') }]}>
          <Input prefix={<UserOutlined />} placeholder={t('login.username')} />
        </Form.Item>

        <Form.Item
          name='password'
          rules={[{ required: true, message: t('login.passwordRequired') }]}
          style={{ marginBottom: 24 }}
        >
          <Input.Password prefix={<LockOutlined />} placeholder={t('login.password')} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button type='primary' htmlType='submit' block loading={isLoading}>
            {t('login.submit')}
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center' }}>
          <Link to='/forgot-password'>
            <Button type='link' size='small'>
              {t('login.forgot')}
            </Button>
          </Link>
        </div>
      </Form>
    </Card>
  )
}

export default LoginPage
