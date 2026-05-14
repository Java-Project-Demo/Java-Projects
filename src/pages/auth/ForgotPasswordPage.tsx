import { App, Button, Card, Form, Input, Typography } from 'antd'
import { ArrowLeftOutlined, MailOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useForgotPasswordMutation } from '@/features/auth/authApi'
import { useState } from 'react'

const { Title, Text } = Typography

const ForgotPasswordPage = () => {
  const { message } = App.useApp()
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const onFinish = async (values: { email: string }) => {
    try {
      await forgotPassword(values).unwrap()
      setSentEmail(values.email)
      setSent(true)
    } catch {
      void message.error('Không tìm thấy tài khoản với email này')
    }
  }

  if (sent) {
    return (
      <Card style={{ width: 400 }} styles={{ body: { padding: '40px 32px' } }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <MailOutlined style={{ fontSize: 48, color: '#E8603C', marginBottom: 16 }} />
          <Title level={4} style={{ margin: 0 }}>
            Kiểm tra hộp thư
          </Title>
          <Text type='secondary'>
            Đã gửi link đặt lại mật khẩu đến <strong>{sentEmail}</strong>. Link có hiệu lực trong 15 phút.
          </Text>
        </div>
        <Link to='/login'>
          <Button icon={<ArrowLeftOutlined />} block>
            Quay lại đăng nhập
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <Card style={{ width: 400 }} styles={{ body: { padding: '40px 32px' } }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={3} style={{ margin: 0 }}>
          Quên mật khẩu
        </Title>
        <Text type='secondary'>Nhập email để nhận link đặt lại mật khẩu</Text>
      </div>

      <Form layout='vertical' onFinish={onFinish} autoComplete='off' size='large'>
        <Form.Item
          name='email'
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder='Email của bạn' />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button type='primary' htmlType='submit' block loading={isLoading}>
            Gửi link đặt lại mật khẩu
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center' }}>
          <Link to='/login'>
            <Button type='link' icon={<ArrowLeftOutlined />} size='small'>
              Quay lại đăng nhập
            </Button>
          </Link>
        </div>
      </Form>
    </Card>
  )
}

export default ForgotPasswordPage
