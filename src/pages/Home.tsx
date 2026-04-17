import { Avatar, Badge, Button, Card, Col, List, Row, Space, Statistic, Table, Tag, Typography } from 'antd'
import {
  ShoppingOutlined, WarningOutlined, ImportOutlined, ExportOutlined,
  ArrowUpOutlined, ArrowDownOutlined, ClockCircleOutlined, CheckCircleOutlined,
  UserOutlined, RightOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

const { Title, Text } = Typography
const PRIMARY = '#E8603C'

const cardStyle = {
  borderRadius: 12,
  boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
  height: '100%'
}

const LOW_STOCK = [
  { key: '1', ten: 'Laptop Dell XPS 15 9530',         sku: 'SP-10002', ton: 12,  nguong: 20, danhMuc: 'Điện tử' },
  { key: '2', ten: 'Máy bơm nước Panasonic GP-200JXK', sku: 'SP-10003', ton: 8,   nguong: 20, danhMuc: 'Cơ khí' },
  { key: '3', ten: 'Màn hình Samsung 24" F24T350',     sku: 'SP-10007', ton: 18,  nguong: 20, danhMuc: 'Điện tử' },
  { key: '4', ten: 'Máy hàn điện Riland ARC-200',      sku: 'SP-10010', ton: 15,  nguong: 20, danhMuc: 'Dụng cụ' },
  { key: '5', ten: 'Máy cắt kim loại Makita GA5030',   sku: 'SP-10013', ton: 10,  nguong: 20, danhMuc: 'Cơ khí' },
]

const RECENT_ACTIVITY = [
  { id: 1, loai: 'nhap', noi_dung: 'Nhập kho Máy khoan điện Bosch x50', nguoi: 'Nguyễn Văn A', tg: '10 phút trước', trang_thai: 'hoan_thanh' },
  { id: 2, loai: 'xuat', noi_dung: 'Xuất kho Bút bi Thiên Long x200',   nguoi: 'Trần Thị B',   tg: '32 phút trước', trang_thai: 'hoan_thanh' },
  { id: 3, loai: 'yeu_cau', noi_dung: 'Yêu cầu nhập RAM DDR5 Kingston',   nguoi: 'Lê Văn C',     tg: '1 giờ trước',  trang_thai: 'cho_duyet' },
  { id: 4, loai: 'xuat', noi_dung: 'Xuất kho Giấy A4 Double A x10 hộp', nguoi: 'Phạm Thị D',   tg: '2 giờ trước',  trang_thai: 'hoan_thanh' },
  { id: 5, loai: 'nhap', noi_dung: 'Nhập kho Dao mổ y tế x100 hộp',     nguoi: 'Hoàng Văn E',  tg: '3 giờ trước',  trang_thai: 'hoan_thanh' },
]

const TOP_PRODUCTS = [
  { key: '1', ten: 'Laptop Dell XPS 15', doanhthu: 168000000, so_don: 6 },
  { key: '2', ten: 'Samsung Galaxy S24', doanhthu: 132000000, so_don: 6 },
  { key: '3', ten: 'Động cơ điện 3 pha', doanhthu: 112500000, so_don: 25 },
  { key: '4', ten: 'Màn hình Samsung 24"', doanhthu:  86400000, so_don: 18 },
  { key: '5', ten: 'Máy cắt Makita GA5030', doanhthu:  60000000, so_don: 10 },
]

const Home = () => {
  const navigate = useNavigate()
  const user = useAppSelector(s => s.auth.user)
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  const kpis = [
    { title: 'Tổng sản phẩm', value: 20, icon: <ShoppingOutlined />, color: PRIMARY, trend: '+5%', up: true, sub: 'mặt hàng' },
    { title: 'Sắp / Hết hàng', value: 8,  icon: <WarningOutlined />, color: '#faad14', trend: '+2',  up: true,  sub: 'cần nhập thêm' },
    { title: 'Nhập tháng này', value: 625, icon: <ImportOutlined />, color: '#52c41a', trend: '+12%', up: true, sub: 'đơn vị' },
    { title: 'Xuất tháng này', value: 450, icon: <ExportOutlined />, color: '#1677ff', trend: '+8%',  up: true, sub: 'đơn vị' },
  ]

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {greeting}, <span style={{ color: PRIMARY }}>{user?.username ?? 'Admin'}</span> 👋
          </Title>
          <Text type='secondary'>
            {now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </div>
        <Space>
          <Button type='primary' icon={<ImportOutlined />} onClick={() => navigate('/nhap-kho')}>Nhập kho</Button>
          <Button icon={<ExportOutlined />} onClick={() => navigate('/xuat-kho')}>Xuất kho</Button>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <Col xs={24} sm={12} xl={6} key={i}>
            <Card style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type='secondary' style={{ fontSize: 13 }}>{k.title}</Text>
                  <Statistic value={k.value} suffix={<span style={{ fontSize: 12, color: '#aaa' }}>{k.sub}</span>}
                    valueStyle={{ fontSize: 28, fontWeight: 700, color: k.color }} />
                  <Space size={4} style={{ marginTop: 4 }}>
                    {k.up ? <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 11 }} /> : <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: 11 }} />}
                    <Text style={{ fontSize: 12, color: k.up ? '#52c41a' : '#ff4d4f' }}>{k.trend} tháng trước</Text>
                  </Space>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: `${k.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: k.color }}>
                  {k.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Low Stock Alert */}
        <Col xs={24} lg={14}>
          <Card
            style={cardStyle}
            title={<Space><WarningOutlined style={{ color: '#faad14' }} /><span>Cảnh báo sắp hết hàng</span></Space>}
            extra={<Button type='link' size='small' onClick={() => navigate('/vat-tu')} icon={<RightOutlined />}>Xem tất cả</Button>}
          >
            <Table
              rowKey='key'
              size='small'
              pagination={false}
              dataSource={LOW_STOCK}
              columns={[
                { title: 'Sản phẩm', dataIndex: 'ten', key: 'ten', ellipsis: true,
                  render: (v, r) => <div><div style={{ fontWeight: 600, fontSize: 13 }}>{v}</div><Text type='secondary' style={{ fontSize: 11 }}>{r.sku}</Text></div> },
                { title: 'Danh mục', dataIndex: 'danhMuc', key: 'danhMuc', width: 120, render: v => <Tag>{v}</Tag> },
                { title: 'Tồn kho', key: 'ton', width: 100,
                  render: (_, r) => (
                    <span style={{ fontWeight: 700, color: r.ton === 0 ? '#ff4d4f' : '#faad14' }}>
                      {r.ton} / {r.nguong}
                    </span>
                  )
                },
                { title: '', key: 'act', width: 80,
                  render: () => <Button size='small' type='primary' ghost onClick={() => navigate('/nhap-kho')}>Nhập kho</Button> }
              ]}
            />
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={10}>
          <Card
            style={cardStyle}
            title={<Space><ClockCircleOutlined style={{ color: PRIMARY }} /><span>Hoạt động gần đây</span></Space>}
          >
            <List
              dataSource={RECENT_ACTIVITY}
              renderItem={item => (
                <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <Space align='start' style={{ width: '100%' }}>
                    <Avatar size={32} style={{
                      background: item.loai === 'nhap' ? '#f6ffed' : item.loai === 'xuat' ? '#e6f4ff' : '#fff7e6',
                      color: item.loai === 'nhap' ? '#52c41a' : item.loai === 'xuat' ? '#1677ff' : '#faad14',
                      flexShrink: 0
                    }}>
                      {item.loai === 'nhap' ? <ImportOutlined /> : item.loai === 'xuat' ? <ExportOutlined /> : <ClockCircleOutlined />}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, lineHeight: '1.4' }}>{item.noi_dung}</div>
                      <Space size={8}>
                        <Text type='secondary' style={{ fontSize: 11 }}><UserOutlined /> {item.nguoi}</Text>
                        <Text type='secondary' style={{ fontSize: 11 }}>{item.tg}</Text>
                      </Space>
                    </div>
                    {item.trang_thai === 'hoan_thanh'
                      ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 14 }} />
                      : <Badge status='processing' />
                    }
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Top Products */}
        <Col xs={24}>
          <Card style={cardStyle} title='Top 5 sản phẩm doanh thu cao nhất tháng này'
            extra={<Button type='link' size='small' onClick={() => navigate('/thong-ke')} icon={<RightOutlined />}>Xem báo cáo</Button>}>
            <Row gutter={[16, 8]} align='middle' style={{ marginBottom: 8, fontWeight: 600, color: '#888', fontSize: 12 }}>
              <Col span={1}>#</Col><Col span={10}>Sản phẩm</Col><Col span={9}>Doanh thu</Col><Col span={4} style={{ textAlign: 'right' }}>Số đơn</Col>
            </Row>
            {TOP_PRODUCTS.map((p, i) => {
              const pct = Math.round((p.doanhthu / TOP_PRODUCTS[0].doanhthu) * 100)
              return (
                <Row gutter={[16, 8]} align='middle' key={p.key} style={{ marginBottom: 12 }}>
                  <Col span={1}><Text type='secondary' style={{ fontSize: 13 }}>{i + 1}</Text></Col>
                  <Col span={10}><Text style={{ fontSize: 13, fontWeight: 500 }}>{p.ten}</Text></Col>
                  <Col span={9}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 8, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: PRIMARY, borderRadius: 4 }} />
                      </div>
                      <Text style={{ fontSize: 12, width: 90, flexShrink: 0 }}>
                        {p.doanhthu.toLocaleString('vi-VN')} ₫
                      </Text>
                    </div>
                  </Col>
                  <Col span={4} style={{ textAlign: 'right' }}>
                    <Tag color='blue'>{p.so_don} đơn</Tag>
                  </Col>
                </Row>
              )
            })}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Home
