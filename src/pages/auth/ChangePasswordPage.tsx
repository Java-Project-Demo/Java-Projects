import { App, Alert, Button, Card, Form, Input, Typography } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('auth')
  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const mustChange = useAppSelector((s) => s.auth.mustChangePassword)
  const user = useAppSelector((s) => s.auth.user)

  const onFinish = async (values: FormValues) => {
    if (values.newPassword !== values.confirmPassword) {
      void message.error(t('changePassword.mismatch'))
      return
    }
    try {
      await changePassword(values).unwrap()
      dispatch(clearMustChangePassword())
      void message.success(t('changePassword.success'))
      navigate('/', { replace: true })
    } catch {
      void message.error(t('changePassword.fail'))
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
          {t('changePassword.title')}
        </Title>
        <Text type='secondary'>{t('changePassword.hello', { name: user?.username ?? '' })}</Text>
      </div>

      {mustChange && (
        <Alert
          type='warning'
          showIcon
          style={{ marginBottom: 20 }}
          message={t('changePassword.mustChangeMessage')}
          description={t('changePassword.mustChangeDescription')}
        />
      )}

      <Form layout='vertical' onFinish={onFinish} autoComplete='off' size='large'>
        <Form.Item
          name='oldPassword'
          label={t('changePassword.oldPassword')}
          rules={[{ required: true, message: t('changePassword.oldPasswordRequired') }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder={t('changePassword.oldPasswordPlaceholder')} />
        </Form.Item>

        <Form.Item
          name='newPassword'
          label={t('changePassword.newPassword')}
          rules={[
            { required: true, message: t('changePassword.newPasswordRequired') },
            { min: 6, message: t('changePassword.minLength') }
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder={t('changePassword.newPasswordPlaceholder')} />
        </Form.Item>

        <Form.Item
          name='confirmPassword'
          label={t('changePassword.confirmPassword')}
          dependencies={['newPassword']}
          rules={[
            { required: true, message: t('changePassword.confirmPasswordRequired') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) return Promise.resolve()
                return Promise.reject(new Error(t('changePassword.mismatch')))
              }
            })
          ]}
          style={{ marginBottom: 24 }}
        >
          <Input.Password prefix={<LockOutlined />} placeholder={t('changePassword.confirmPasswordPlaceholder')} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 8 }}>
          <Button type='primary' htmlType='submit' block loading={isLoading}>
            {t('changePassword.submit')}
          </Button>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type='link' block onClick={handleLogout}>
            {t('changePassword.logout')}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default ChangePasswordPage
