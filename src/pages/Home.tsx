import { Card, Col, Row, Statistic, Typography } from 'antd'
import { TeamOutlined, UserOutlined } from '@ant-design/icons'

const { Title } = Typography

const Home = () => {
  return (
    <>
      <Title level={4} style={{ marginBottom: 24 }}>
        Dashboard
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title='Tổng người dùng'
              value={0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title='Đang hoạt động'
              value={0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Home
