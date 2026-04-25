import { Breadcrumb, Card, Result, Typography } from 'antd'
import { HomeOutlined, ClockCircleOutlined } from '@ant-design/icons'

const { Text } = Typography
const PRIMARY = '#E8603C'

// TODO: Backend chưa có endpoint GET/POST /yeu-cau — tính năng này cần được implement ở backend trước

const YeuCauPage = () => {
  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}
        items={[{ href: '/', title: <HomeOutlined /> }, { title: 'Yêu cầu' }]} />

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <Result
          icon={<ClockCircleOutlined style={{ color: PRIMARY }} />}
          title='Tính năng đang được phát triển'
          subTitle={
            <Text type='secondary'>
              Module quản lý yêu cầu nhập/xuất chưa có API backend tương ứng.
              Vui lòng liên hệ nhóm phát triển để được hỗ trợ thêm tính năng này.
            </Text>
          }
        />
      </Card>
    </div>
  )
}

export default YeuCauPage
