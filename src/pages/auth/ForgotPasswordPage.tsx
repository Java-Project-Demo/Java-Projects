import { App, Button, Card, Form, Input, Typography } from 'antd'
import { ArrowLeftOutlined, MailOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { useForgotPasswordMutation } from '@/features/auth/authApi'
import { useState } from 'react'

const { Title, Text } = Typography

const ForgotPasswordPage = () => {
  const { message } = App.useApp()
  const { t } = useTranslation('auth')
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const onFinish = async (values: { email: string }) => {
    try {
      await forgotPassword(values).unwrap()
      setSentEmail(values.email)
      setSent(true)
    } catch {
      void message.error(t('forgot.notFound'))
    }
  }

  if (sent) {
    return (
      <Card style={{ width: 400 }} styles={{ body: { padding: '40px 32px' } }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <MailOutlined style={{ fontSize: 48, color: '#E8603C', marginBottom: 16 }} />
          <Title level={4} style={{ margin: 0 }}>
            {t('forgot.sentTitle')}
          </Title>
          <Text type='secondary'>
            <Trans i18nKey='forgot.sentSubtitle' ns='auth' values={{ email: sentEmail }} components={[<strong key='0' />]} />
          </Text>
        </div>
        <Link to='/login'>
          <Button icon={<ArrowLeftOutlined />} block>
            {t('forgot.backToLogin')}
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <Card style={{ width: 400 }} styles={{ body: { padding: '40px 32px' } }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={3} style={{ margin: 0 }}>
          {t('forgot.title')}
        </Title>
        <Text type='secondary'>{t('forgot.subtitle')}</Text>
      </div>

      <Form layout='vertical' onFinish={onFinish} autoComplete='off' size='large'>
        <Form.Item
          name='email'
          rules={[
            { required: true, message: t('forgot.emailRequired') },
            { type: 'email', message: t('forgot.emailInvalid') }
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder={t('forgot.emailPlaceholder')} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button type='primary' htmlType='submit' block loading={isLoading}>
            {t('forgot.submit')}
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center' }}>
          <Link to='/login'>
            <Button type='link' icon={<ArrowLeftOutlined />} size='small'>
              {t('forgot.backToLogin')}
            </Button>
          </Link>
        </div>
      </Form>
    </Card>
  )
}

export default ForgotPasswordPage
