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
  PieChart, Pie, Cell, Tooltip as RTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@/app/hooks'
import { useGetDashboardSummaryQuery, useGetLowStockQuery } from '@/features/dashboard/dashboardApi'
import { useGetCategoriesQuery } from '@/features/category/categoryApi'
import { useGetProductsQuery } from '@/features/product/productApi'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay'
import { useLocaleFormat } from '@/utils/useLocaleFormat'
import { useCan } from '@/utils/permissions'
import type { AuditLog, Product } from '@/types/api'

const { Title, Text } = Typography
const PRIMARY = '#E8603C'

const CHART_COLORS = ['#E8603C', '#1677ff', '#52c41a', '#faad14', '#722ed1', '#13c2c2', '#eb2f96']
const OTHERS_COLOR = '#8c8c8c'
const TOP_PIE_CATEGORIES = 6

const cardStyle = { borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', height: '100%' }

type PieSlice = { name: string; value: number; isOthers?: boolean }

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
  if ((percent as number) < 0.08) return null
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
  const { t } = useTranslation(['home', 'common'])
  const { localeTag, dateTime } = useLocaleFormat()
  const canViewRevenue = useCan('REVENUE_VIEW')
  const canViewLogs = useCan('AUDIT_LOG_VIEW')
  const canViewLowStock = useCan('LOW_STOCK_VIEW')
  const canViewTopSelling = useCan('TOP_SELLING_VIEW')
  const canImport = useCan('STOCK_IMPORT')
  const canExport = useCan('STOCK_EXPORT')
  const now = new Date()
  const greeting =
    now.getHours() < 12
      ? t('common:user.greeting.morning')
      : now.getHours() < 18
      ? t('common:user.greeting.afternoon')
      : t('common:user.greeting.evening')

  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummaryQuery()
  const { data: lowStock = [], isLoading: loadingLowStock } = useGetLowStockQuery()
  const { data: categories = [] } = useGetCategoriesQuery()
  const { data: products = [] } = useGetProductsQuery()

  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories])
  const pieData = useMemo(() => {
    const counts: Record<number, { name: string; value: number }> = {}
    products.forEach((p) => {
      if (!counts[p.categoryId]) counts[p.categoryId] = { name: catMap[p.categoryId] ?? `#${p.categoryId}`, value: 0 }
      counts[p.categoryId].value += 1
    })
    const all = Object.values(counts)
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value)
    const total = all.reduce((s, c) => s + c.value, 0)
    if (all.length <= TOP_PIE_CATEGORIES + 1) {
      return { slices: all as PieSlice[], total }
    }
    const top = all.slice(0, TOP_PIE_CATEGORIES)
    const rest = all.slice(TOP_PIE_CATEGORIES)
    const othersValue = rest.reduce((s, c) => s + c.value, 0)
    return {
      slices: [
        ...top,
        { name: t('charts.pieOthers', { count: rest.length }), value: othersValue, isOthers: true },
      ] as PieSlice[],
      total,
    }
  }, [products, catMap, t])

  const barData = useMemo(() =>
    [...products]
      .filter((p) => p.currentStock > 0)
      .sort((a, b) => (b.currentStock * b.priceExport) - (a.currentStock * a.priceExport))
      .slice(0, 8)
      .map((p) => ({
        name: p.name.length > 18 ? p.name.substring(0, 16) + '…' : p.name,
        value: Math.round((p.currentStock * p.priceExport) / 1_000_000),
        stock: p.currentStock,
      })),
    [products],
  )

  const kpis = [
    { title: t('kpi.totalProducts'), value: summary?.totalProducts ?? 0, icon: <ShoppingOutlined />, color: PRIMARY, sub: t('kpi.totalProductsSub'), currency: false, visible: true },
    { title: t('kpi.lowStock'), value: summary?.lowStockCount ?? 0, icon: <WarningOutlined />, color: '#faad14', sub: t('kpi.lowStockSub'), currency: false, visible: canViewLowStock },
    { title: t('kpi.pendingOrders'), value: summary?.pendingOrders ?? 0, icon: <ExportOutlined />, color: '#1677ff', sub: t('kpi.pendingOrdersSub'), currency: false, visible: true },
    { title: t('kpi.totalInventoryValue'), value: summary?.totalInventoryValue ?? 0, icon: <DollarOutlined />, color: '#52c41a', sub: '', currency: true, visible: canViewRevenue },
  ].filter((k) => k.visible)

  const recentActivities: AuditLog[] = summary?.recentActivities ?? []

  const lowStockCols = [
    {
      title: t('lowStock.colProduct'), dataIndex: 'name', key: 'name', ellipsis: true,
      render: (v: string, r: Product) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{v}</div>
          <Text type='secondary' style={{ fontSize: 11 }}>{r.sku}</Text>
        </div>
      ),
    },
    {
      title: t('lowStock.colStock'), key: 'stock', width: 110,
      render: (_: unknown, r: Product) => (
        <span style={{ fontWeight: 700, color: r.currentStock === 0 ? '#ff4d4f' : '#faad14' }}>
          {r.currentStock} / {r.minThreshold}
        </span>
      ),
    },
    {
      title: '', key: 'act', width: 90,
      render: () => <Button size='small' type='primary' ghost onClick={() => navigate('/nhap-kho')}>{t('lowStock.actionImport')}</Button>,
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {greeting}, <span style={{ color: PRIMARY }}>{user?.username ?? 'Admin'}</span> 👋
          </Title>
          <Text type='secondary'>
            {now.toLocaleDateString(localeTag, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </div>
        <Space>
          {canImport && (
            <Button type='primary' icon={<ImportOutlined />} onClick={() => navigate('/nhap-kho')}>{t('actions.import')}</Button>
          )}
          {canExport && (
            <Button icon={<ExportOutlined />} onClick={() => navigate('/xuat-kho')}>{t('actions.export')}</Button>
          )}
        </Space>
      </div>

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
                      <Text style={{ fontSize: 12, color: '#52c41a' }}>{t('kpi.latestUpdate')}</Text>
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

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={10}>
          <Card style={cardStyle} title={
            <Space><ShoppingOutlined style={{ color: PRIMARY }} /><span>{t('charts.pieTitle')}</span></Space>
          }>
            {pieData.slices.length === 0 ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <Row gutter={[12, 12]} align='middle'>
                <Col xs={24} sm={12}>
                  <div style={{ position: 'relative' }}>
                    <ResponsiveContainer width='100%' height={240}>
                      <PieChart>
                        <Pie data={pieData.slices} cx='50%' cy='50%' innerRadius={55} outerRadius={100}
                          dataKey='value' labelLine={false} label={PieLabel}>
                          {pieData.slices.map((s, i) => (
                            <Cell key={i} fill={s.isOthers ? OTHERS_COLOR : CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RTooltip
                          formatter={(value, _name, p) => [
                            t('charts.pieTooltipUnit', { count: Number(value ?? 0) }),
                            (p as { payload?: { name: string } })?.payload?.name ?? '',
                          ]}
                          contentStyle={{ fontSize: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none',
                    }}>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>{t('charts.pieTotal')}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: PRIMARY, lineHeight: 1.2 }}>{pieData.total}</div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ maxHeight: 240, overflowY: 'auto', paddingRight: 4 }}>
                    {pieData.slices.map((s, i) => {
                      const pct = pieData.total > 0 ? (s.value / pieData.total) * 100 : 0
                      const color = s.isOthers ? OTHERS_COLOR : CHART_COLORS[i % CHART_COLORS.length]
                      return (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '7px 0', borderBottom: '1px solid #f5f5f5',
                        }}>
                          <span style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                          <Text style={{ flex: 1, fontSize: 12, minWidth: 0 }} ellipsis={{ tooltip: s.name }}>{s.name}</Text>
                          <Text strong style={{ fontSize: 12, flexShrink: 0 }}>{s.value}</Text>
                          <Text type='secondary' style={{ fontSize: 11, width: 36, textAlign: 'right', flexShrink: 0 }}>{pct.toFixed(0)}%</Text>
                        </div>
                      )
                    })}
                  </div>
                </Col>
              </Row>
            )}
          </Card>
        </Col>

        {canViewTopSelling && (
          <Col xs={24} lg={14}>
            <Card style={cardStyle} title={
              <Space><DollarOutlined style={{ color: '#1677ff' }} /><span>{t('charts.barTitle')}</span></Space>
            } extra={
              <Button type='link' size='small' onClick={() => navigate('/vat-tu')} icon={<RightOutlined />}>{t('common:button.viewAll')}</Button>
            }>
              {barData.length === 0 ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : (
                <ResponsiveContainer width='100%' height={280}>
                  <BarChart data={barData} margin={{ top: 8, right: 16, left: 8, bottom: 48 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                    <XAxis dataKey='name' tick={{ fontSize: 11 }} angle={-30} textAnchor='end' interval={0} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}M`} />
                    <RTooltip formatter={(v) => [t('charts.barTooltipUnit', { count: Number(v ?? 0) }), t('charts.barTooltipLabel')]} />
                    <Bar dataKey='value' name={t('charts.barLegend')} radius={[4, 4, 0, 0]}>
                      {barData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Col>
        )}
      </Row>

      <Row gutter={[16, 16]}>
        {canViewLowStock && (
          <Col xs={24} lg={canViewLogs ? 14 : 24}>
            <Card style={cardStyle}
              title={<Space><WarningOutlined style={{ color: '#faad14' }} /><span>{t('lowStock.title')}</span></Space>}
              extra={<Button type='link' size='small' onClick={() => navigate('/vat-tu')} icon={<RightOutlined />}>{t('common:button.viewAll')}</Button>}
            >
              <Table rowKey='id' size='small' pagination={false}
                loading={loadingLowStock} dataSource={lowStock.slice(0, 5)}
                columns={lowStockCols} locale={{ emptyText: t('lowStock.empty') }} />
            </Card>
          </Col>
        )}

        {canViewLogs && (
        <Col xs={24} lg={canViewLowStock ? 10 : 24}>
          <Card style={cardStyle}
            title={<Space><ClockCircleOutlined style={{ color: PRIMARY }} /><span>{t('recent.title')}</span></Space>}
          >
            {loadingSummary
              ? <Skeleton active paragraph={{ rows: 4 }} />
              : recentActivities.length === 0
                ? <Text type='secondary'>{t('recent.empty')}</Text>
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
                                <Text type='secondary' style={{ fontSize: 11 }}><UserOutlined /> {item.staffName ?? item.staffUsername ?? t('recent.userId', { id: item.userId })}</Text>
                                <Text type='secondary' style={{ fontSize: 11 }}>
                                  {item.createdAt ? dateTime(item.createdAt) : ''}
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
        )}

        {canViewRevenue && (
        <Col xs={24}>
          <Card style={cardStyle} title={t('summary.title')}
            extra={<Button type='link' size='small' onClick={() => navigate('/thong-ke')} icon={<RightOutlined />}>{t('common:button.viewReport')}</Button>}
          >
            {loadingSummary
              ? <Skeleton active paragraph={{ rows: 1 }} />
              : (
                <Row gutter={[32, 16]}>
                  <Col xs={12} sm={6}>
                    <Statistic title={t('summary.inventoryValue')} value={summary?.totalInventoryValue ?? 0}
                      formatter={(v) => <CurrencyDisplay value={Number(v)} color={PRIMARY} />} />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic title={t('summary.todayProfit')} value={summary?.todayProfit ?? 0}
                      formatter={(v) => <CurrencyDisplay value={Number(v)} color='#52c41a' />} />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic title={t('summary.activeWarranty')}
                      prefix={<SafetyCertificateOutlined style={{ color: '#faad14', marginRight: 4 }} />}
                      value={summary?.activeWarrantyClaims ?? 0}
                      suffix={t('summary.activeWarrantySuffix')} valueStyle={{ color: '#faad14', fontSize: 18 }} />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic title={t('summary.pendingOrders')}
                      value={summary?.pendingOrders ?? 0}
                      suffix={t('summary.pendingOrdersSuffix')} valueStyle={{ color: '#1677ff', fontSize: 18 }} />
                  </Col>
                </Row>
              )}
          </Card>
        </Col>
        )}
      </Row>
    </div>
  )
}

export default Home
