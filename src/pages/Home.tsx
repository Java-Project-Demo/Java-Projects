import { useMemo } from 'react'
import {
  Avatar, Button, Card, Col, List, Row, Skeleton,
  Space, Statistic, Table, Typography,
} from 'antd'
import {
  ShoppingOutlined, WarningOutlined, ImportOutlined, ExportOutlined,
  ArrowUpOutlined, ClockCircleOutlined, CheckCircleOutlined,
  UserOutlined, RightOutlined, DollarOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons'
import {
  PieChart, Pie, Cell, Tooltip as RTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { useGetDashboardSummaryQuery, useGetLowStockQuery } from '@/features/dashboard/dashboardApi'
import { useGetCategoriesQuery } from '@/features/category/categoryApi'
import { useGetProductsQuery } from '@/features/product/productApi'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay'
import type { AuditLog, Product } from '@/types/api'

const { Title, Text } = Typography
const PRIMARY = '#E8603C'

const CHART_COLORS = ['#E8603C', '#1677ff', '#52c41a', '#faad14', '#722ed1', '#13c2c2', '#eb2f96']

const cardStyle = { borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', height: '100%' }

const actionLabel = (action: string) => {
  if (action?.includes('IMPORT') || action?.includes('STOCK')) return 'nhap'
  if (action?.includes('ORDER') || action?.includes('EXPORT')) return 'xuat'
  return 'khac'
}

const KpiSkeleton = () => (
  <Card style={cardStyle}><Skeleton active paragraph={{ rows: 2 }} /></Card>
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PieLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props
  if ((percent as number) < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = (innerRadius as number) + ((outerRadius as number) - (innerRadius as number)) * 0.5
  const x = (cx as number) + radius * Math.cos(-(midAngle as number) * RADIAN)
  const y = (cy as number) + radius * Math.sin(-(midAngle as number) * RADIAN)
  return (
    <text x={x} y={y} fill='white' textAnchor='middle' dominantBaseline='central' fontSize={12} fontWeight={600}>
      {`${((percent as number) * 100).toFixed(0)}%`}
    </text>
  )
}

const Home = () => {
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.auth.user)
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummaryQuery()
  const { data: lowStock = [], isLoading: loadingLowStock } = useGetLowStockQuery()
  const { data: categories = [] } = useGetCategoriesQuery()
  const { data: products = [] } = useGetProductsQuery()

  // ─── Chart data ───────────────────────────────────────────
  // Pie: Số sản phẩm theo danh mục
  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories])
  const pieData = useMemo(() => {
    const counts: Record<number, { name: string; value: number; stockValue: number }> = {}
    products.forEach((p) => {
      if (!counts[p.categoryId]) counts[p.categoryId] = { name: catMap[p.categoryId] ?? `#${p.categoryId}`, value: 0, stockValue: 0 }
      counts[p.categoryId].value += 1
      counts[p.categoryId].stockValue += p.currentStock * p.priceExport
    })
    return Object.values(counts).filter((c) => c.value > 0)
  }, [products, catMap])

  // Bar: Top 8 sản phẩm theo giá trị tồn kho (currentStock * priceExport)
  const barData = useMemo(() =>
    [...products]
      .filter((p) => p.currentStock > 0)
      .sort((a, b) => (b.currentStock * b.priceExport) - (a.currentStock * a.priceExport))
      .slice(0, 8)
      .map((p) => ({
        name: p.name.length > 18 ? p.name.substring(0, 16) + '…' : p.name,
        'Giá trị (triệu)': Math.round((p.currentStock * p.priceExport) / 1_000_000),
        stock: p.currentStock,
      })),
    [products],
  )

  const kpis = [
    { title: 'Tổng sản phẩm', value: summary?.totalProducts ?? 0, icon: <ShoppingOutlined />, color: PRIMARY, sub: 'mặt hàng', currency: false },
    { title: 'Sắp / Hết hàng', value: summary?.lowStockCount ?? 0, icon: <WarningOutlined />, color: '#faad14', sub: 'cần nhập', currency: false },
    { title: 'Đơn chờ xử lý', value: summary?.pendingOrders ?? 0, icon: <ExportOutlined />, color: '#1677ff', sub: 'đơn hàng', currency: false },
    { title: 'Giá trị tồn kho', value: summary?.totalInventoryValue ?? 0, icon: <DollarOutlined />, color: '#52c41a', sub: '', currency: true },
  ]

  const recentActivities: AuditLog[] = summary?.recentActivities ?? []

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
      render: () => <Button size='small' type='primary' ghost onClick={() => navigate('/nhap-kho')}>Nhập kho</Button>,
    },
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
        {loadingSummary
          ? [0, 1, 2, 3].map((i) => <Col xs={24} sm={12} xl={6} key={i}><KpiSkeleton /></Col>)
          : kpis.map((k, i) => (
            <Col xs={24} sm={12} xl={6} key={i}>
              <Card style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Text type='secondary' style={{ fontSize: 13 }}>{k.title}</Text>
                    {k.currency ? (
                      <div style={{ margin: '4px 0' }}>
                        <CurrencyDisplay value={k.value} color={k.color} size='large' />
                      </div>
                    ) : (
                      <Statistic value={k.value}
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

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Pie Chart — phân bổ theo danh mục */}
        <Col xs={24} lg={10}>
          <Card style={cardStyle} title={
            <Space><ShoppingOutlined style={{ color: PRIMARY }} /><span>Phân bổ sản phẩm theo danh mục</span></Space>
          }>
            {pieData.length === 0 ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <ResponsiveContainer width='100%' height={280}>
                <PieChart>
                  <Pie data={pieData} cx='50%' cy='50%' innerRadius={60} outerRadius={110}
                    dataKey='value' labelLine={false} label={PieLabel}>
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip
                    formatter={(value) => [`${String(value ?? 0)} sản phẩm`, 'Số lượng']}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Legend formatter={(value: string) => <span style={{ fontSize: 12 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        {/* Bar Chart — top sản phẩm theo giá trị tồn */}
        <Col xs={24} lg={14}>
          <Card style={cardStyle} title={
            <Space><DollarOutlined style={{ color: '#1677ff' }} /><span>Top sản phẩm theo giá trị tồn kho</span></Space>
          } extra={
            <Button type='link' size='small' onClick={() => navigate('/vat-tu')} icon={<RightOutlined />}>Xem tất cả</Button>
          }>
            {barData.length === 0 ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <ResponsiveContainer width='100%' height={280}>
                <BarChart data={barData} margin={{ top: 8, right: 16, left: 8, bottom: 48 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                  <XAxis dataKey='name' tick={{ fontSize: 11 }} angle={-30} textAnchor='end' interval={0} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}M`} />
                  <RTooltip formatter={(v) => [`${String(v ?? 0)} triệu ₫`, 'Giá trị tồn']} />
                  <Bar dataKey='Giá trị (triệu)' radius={[4, 4, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>

      {/* Low Stock + Recent Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card style={cardStyle}
            title={<Space><WarningOutlined style={{ color: '#faad14' }} /><span>Cảnh báo sắp hết hàng</span></Space>}
            extra={<Button type='link' size='small' onClick={() => navigate('/vat-tu')} icon={<RightOutlined />}>Xem tất cả</Button>}
          >
            <Table rowKey='id' size='small' pagination={false}
              loading={loadingLowStock} dataSource={lowStock.slice(0, 5)}
              columns={lowStockCols} locale={{ emptyText: 'Không có sản phẩm sắp hết hàng 🎉' }} />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card style={cardStyle}
            title={<Space><ClockCircleOutlined style={{ color: PRIMARY }} /><span>Hoạt động gần đây</span></Space>}
          >
            {loadingSummary
              ? <Skeleton active paragraph={{ rows: 4 }} />
              : recentActivities.length === 0
                ? <Text type='secondary'>Chưa có hoạt động nào</Text>
                : (
                  <List dataSource={recentActivities}
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
                              <div style={{ fontSize: 13, fontWeight: 500 }}>
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

        {/* Summary stats */}
        <Col xs={24}>
          <Card style={cardStyle} title='Tóm tắt kho hàng'
            extra={<Button type='link' size='small' onClick={() => navigate('/thong-ke')} icon={<RightOutlined />}>Xem báo cáo</Button>}
          >
            {loadingSummary
              ? <Skeleton active paragraph={{ rows: 1 }} />
              : (
                <Row gutter={[32, 16]}>
                  <Col xs={12} sm={6}>
                    <Statistic title='Giá trị tồn kho' value={summary?.totalInventoryValue ?? 0}
                      formatter={(v) => <CurrencyDisplay value={Number(v)} color={PRIMARY} />} />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic title='Lợi nhuận hôm nay' value={summary?.todayProfit ?? 0}
                      formatter={(v) => <CurrencyDisplay value={Number(v)} color='#52c41a' />} />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic title='Bảo hành đang xử lý'
                      prefix={<SafetyCertificateOutlined style={{ color: '#faad14', marginRight: 4 }} />}
                      value={summary?.activeWarrantyClaims ?? 0}
                      suffix='ca' valueStyle={{ color: '#faad14', fontSize: 18 }} />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic title='Đơn hàng chờ xử lý'
                      value={summary?.pendingOrders ?? 0}
                      suffix='đơn' valueStyle={{ color: '#1677ff', fontSize: 18 }} />
                  </Col>
                </Row>
              )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Home
