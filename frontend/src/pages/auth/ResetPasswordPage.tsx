import { App, Button, Card, Form, Input, Typography } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useResetPasswordByTokenMutation } from '@/features/auth/authApi'

const { Title, Text } = Typography

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const { message } = App.useApp()
  const { t } = useTranslation('auth')
  const [resetPassword, { isLoading }] = useResetPasswordByTokenMutation()

  const onFinish = async (values: { newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      void message.error(t('reset.tokenInvalid'))
      return
    }
    try {
      await resetPassword({ token, ...values }).unwrap()
      void message.success(t('reset.success'))
      navigate('/login', { replace: true })
    } catch (err: unknown) {
      const errMsg =
        typeof err === 'object' && err !== null && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined
      void message.error(errMsg ?? t('reset.tokenInvalid'))
    }
  }

  if (!token) {
    return (
      <Card style={{ width: 400 }} styles={{ body: { padding: '40px 32px' } }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={4} style={{ color: '#ff4d4f' }}>
            {t('reset.invalidLinkTitle')}
          </Title>
          <Text type='secondary'>{t('reset.invalidLinkSubtitle')}</Text>
        </div>
      </Card>
    )
  }

  return (
    <Card style={{ width: 400 }} styles={{ body: { padding: '40px 32px' } }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={3} style={{ margin: 0 }}>
          {t('reset.title')}
        </Title>
        <Text type='secondary'>{t('reset.subtitle')}</Text>
      </div>

      <Form layout='vertical' onFinish={onFinish} autoComplete='off' size='large'>
        <Form.Item
          name='newPassword'
          rules={[
            { required: true, message: t('reset.newPasswordRequired') },
            { min: 6, message: t('reset.minLength') }
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder={t('reset.newPassword')} />
        </Form.Item>

        <Form.Item
          name='confirmPassword'
          rules={[{ required: true, message: t('reset.confirmPasswordRequired') }]}
          style={{ marginBottom: 24 }}
        >
          <Input.Password prefix={<LockOutlined />} placeholder={t('reset.confirmPassword')} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type='primary' htmlType='submit' block loading={isLoading}>
            {t('reset.submit')}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default ResetPasswordPage
