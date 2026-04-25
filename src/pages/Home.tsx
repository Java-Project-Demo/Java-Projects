import { Avatar, Button, Card, Col, List, Row, Space, Statistic, Table, Typography } from 'antd'
import {
  ShoppingOutlined, WarningOutlined, ImportOutlined, ExportOutlined,
  ArrowUpOutlined, ClockCircleOutlined, CheckCircleOutlined,
  UserOutlined, RightOutlined, DollarOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { useGetDashboardSummaryQuery, useGetLowStockQuery } from '@/features/dashboard/dashboardApi'
import type { Product, AuditLog } from '@/types/api'

const { Title, Text } = Typography
const PRIMARY = '#E8603C'

const cardStyle = {
  borderRadius: 12,
  boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
  height: '100%',
}

const fmtCurrency = (v: number) =>
  (v ?? 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

const actionLabel = (action: string) => {
  if (action?.includes('IMPORT') || action?.includes('STOCK')) return 'nhap'
  if (action?.includes('ORDER') || action?.includes('EXPORT')) return 'xuat'
  return 'khac'
}

const Home = () => {
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.auth.user)
  const now = new Date()
  const greeting =
    now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummaryQuery()
  const { data: lowStock = [], isLoading: loadingLowStock } = useGetLowStockQuery()

  const kpis = [
    { title: 'Tổng sản phẩm', value: summary?.totalProducts ?? 0, icon: <ShoppingOutlined />, color: PRIMARY, sub: 'mặt hàng', currency: false },
    { title: 'Sắp / Hết hàng', value: summary?.lowStockCount ?? 0, icon: <WarningOutlined />, color: '#faad14', sub: 'cần nhập', currency: false },
    { title: 'Đơn chờ xử lý', value: summary?.pendingOrders ?? 0, icon: <ExportOutlined />, color: '#1677ff', sub: 'đơn hàng', currency: false },
    { title: 'Doanh thu hôm nay', value: summary?.todayRevenue ?? 0, icon: <DollarOutlined />, color: '#52c41a', sub: '', currency: true },
  ]

  const lowStockCols = [
    {
      title: 'Sản phẩm', dataIndex: 'name', key: 'name', ellipsis: true,
      render: (v: string, r: Product) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{v}</div>
          <Text type='secondary' style={{ fontSize: 11 }}>{r.sku}</Text>
        </div>
      ),
    },
    {
      title: 'Tồn / Ngưỡng', key: 'stock', width: 110,
      render: (_: unknown, r: Product) => (
        <span style={{ fontWeight: 700, color: r.currentStock === 0 ? '#ff4d4f' : '#faad14' }}>
          {r.currentStock} / {r.minThreshold}
        </span>
      ),
    },
    {
      title: '', key: 'act', width: 90,
      render: () => (
        <Button size='small' type='primary' ghost onClick={() => navigate('/nhap-kho')}>Nhập kho</Button>
      ),
    },
  ]

  const recentActivities: AuditLog[] = summary?.recentActivities ?? []

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
            <Card style={cardStyle} loading={loadingSummary}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type='secondary' style={{ fontSize: 13 }}>{k.title}</Text>
                  {k.currency ? (
                    <div style={{ fontSize: 20, fontWeight: 700, color: k.color, margin: '4px 0' }}>
                      {fmtCurrency(k.value)}
                    </div>
                  ) : (
                    <Statistic
                      value={k.value}
                      suffix={<span style={{ fontSize: 12, color: '#aaa' }}>{k.sub}</span>}
                      valueStyle={{ fontSize: 28, fontWeight: 700, color: k.color }}
                    />
                  )}
                  <Space size={4} style={{ marginTop: 4 }}>
                    <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 11 }} />
                    <Text style={{ fontSize: 12, color: '#52c41a' }}>Cập nhật mới nhất</Text>
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
        {/* Low Stock */}
        <Col xs={24} lg={14}>
          <Card
            style={cardStyle}
            title={<Space><WarningOutlined style={{ color: '#faad14' }} /><span>Cảnh báo sắp hết hàng</span></Space>}
            extra={<Button type='link' size='small' onClick={() => navigate('/vat-tu')} icon={<RightOutlined />}>Xem tất cả</Button>}
          >
            <Table
              rowKey='id' size='small' pagination={false}
              loading={loadingLowStock} dataSource={lowStock.slice(0, 5)}
              columns={lowStockCols} locale={{ emptyText: 'Không có sản phẩm sắp hết hàng' }}
            />
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={10}>
          <Card
            style={cardStyle}
            title={<Space><ClockCircleOutlined style={{ color: PRIMARY }} /><span>Hoạt động gần đây</span></Space>}
            loading={loadingSummary}
          >
            {recentActivities.length === 0 ? (
              <Text type='secondary'>Chưa có hoạt động nào</Text>
            ) : (
              <List
                dataSource={recentActivities}
                renderItem={(item: AuditLog) => {
                  const loai = actionLabel(item.action)
                  return (
                    <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <Space align='start' style={{ width: '100%' }}>
                        <Avatar size={32} style={{
                          background: loai === 'nhap' ? '#f6ffed' : loai === 'xuat' ? '#e6f4ff' : '#fff7e6',
                          color: loai === 'nhap' ? '#52c41a' : loai === 'xuat' ? '#1677ff' : '#faad14',
                          flexShrink: 0,
                        }}>
                          {loai === 'nhap' ? <ImportOutlined /> : loai === 'xuat' ? <ExportOutlined /> : <ClockCircleOutlined />}
                        </Avatar>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, lineHeight: '1.4' }}>
                            {item.action} — {item.entityName}
                          </div>
                          <Space size={8}>
                            <Text type='secondary' style={{ fontSize: 11 }}><UserOutlined /> ID {item.userId}</Text>
                            <Text type='secondary' style={{ fontSize: 11 }}>
                              {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}
                            </Text>
                          </Space>
                        </div>
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 14 }} />
                      </Space>
                    </List.Item>
                  )
                }}
              />
            )}
          </Card>
        </Col>

        {/* Tóm tắt */}
        <Col xs={24}>
          <Card
            style={cardStyle} title='Tóm tắt kho hàng hôm nay'
            extra={<Button type='link' size='small' onClick={() => navigate('/thong-ke')} icon={<RightOutlined />}>Xem báo cáo</Button>}
            loading={loadingSummary}
          >
            <Row gutter={[32, 16]}>
              <Col xs={12} sm={6}>
                <Statistic title='Giá trị tồn kho' value={summary?.totalInventoryValue ?? 0}
                  formatter={(v) => fmtCurrency(Number(v))} valueStyle={{ color: PRIMARY, fontSize: 18 }} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title='Lợi nhuận hôm nay' value={summary?.todayProfit ?? 0}
                  formatter={(v) => fmtCurrency(Number(v))} valueStyle={{ color: '#52c41a', fontSize: 18 }} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title='Bảo hành đang xử lý' value={summary?.activeWarrantyClaims ?? 0}
                  suffix='ca' valueStyle={{ color: '#faad14', fontSize: 18 }} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title='Đơn hàng chờ' value={summary?.pendingOrders ?? 0}
                  suffix='đơn' valueStyle={{ color: '#1677ff', fontSize: 18 }} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Home
