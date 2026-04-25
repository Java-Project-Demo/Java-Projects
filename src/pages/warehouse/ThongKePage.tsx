import { Breadcrumb, Card, Col, Row, Statistic, Table, Tag, Typography } from 'antd'
import { HomeOutlined, ShoppingOutlined, WarningOutlined, DollarOutlined, ExportOutlined } from '@ant-design/icons'
import { useGetDashboardSummaryQuery, useGetLowStockQuery } from '@/features/dashboard/dashboardApi'
import { useGetCategoriesQuery } from '@/features/category/categoryApi'
import { useGetAuditLogsQuery } from '@/features/auditLog/auditLogApi'
import type { AuditLog, Category, Product } from '@/types/api'

const { Title, Text } = Typography
const PRIMARY = '#E8603C'

const fmtCurrency = (v: number) =>
  (v ?? 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

const BarRow = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <Text style={{ fontSize: 13 }}>{label}</Text>
      <Text style={{ fontSize: 13, color }}>{value}</Text>
    </div>
    <div style={{ height: 10, background: '#f5f5f5', borderRadius: 5, overflow: 'hidden' }}>
      <div style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, height: '100%', background: color, borderRadius: 5, transition: 'width 0.5s ease' }} />
    </div>
  </div>
)

const ThongKePage = () => {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummaryQuery()
  const { data: lowStock = [], isLoading: loadingLowStock } = useGetLowStockQuery()
  const { data: categories = [] } = useGetCategoriesQuery()
  const { data: logs = [], isLoading: loadingLogs } = useGetAuditLogsQuery({ page: 0, size: 20 })

  const maxStock = Math.max(...categories.map((c: Category) => c.items?.length ?? 0), 1)

  const logColumns = [
    { title: 'Thời gian', dataIndex: 'createdAt', key: 'time', width: 160,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v ? new Date(v).toLocaleString('vi-VN') : '—'}</Text> },
    { title: 'Hành động', dataIndex: 'action', key: 'action', width: 160,
      render: (v: string) => <Tag color={v?.includes('CREATE') ? 'green' : v?.includes('DELETE') ? 'red' : 'blue'}>{v}</Tag> },
    { title: 'Đối tượng', dataIndex: 'entityName', key: 'entity', width: 120 },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 100,
      render: (v: string) => <Tag color={v === 'SUCCESS' ? 'green' : 'red'}>{v}</Tag> },
    { title: 'Chi tiết', dataIndex: 'details', key: 'details', ellipsis: true,
      render: (v: string) => <Text type='secondary' style={{ fontSize: 12 }}>{v ?? '—'}</Text> },
  ]

  const lowStockColumns = [
    { title: 'Sản phẩm', dataIndex: 'name', key: 'name', ellipsis: true,
      render: (v: string, r: Product) => (<div><div style={{ fontWeight: 600, fontSize: 13 }}>{v}</div><Text type='secondary' style={{ fontSize: 11 }}>{r.sku}</Text></div>) },
    { title: 'Tồn kho', dataIndex: 'currentStock', key: 'stock', width: 90,
      render: (v: number) => <Text style={{ fontWeight: 700, color: v === 0 ? '#ff4d4f' : '#faad14' }}>{v}</Text> },
    { title: 'Ngưỡng', dataIndex: 'minThreshold', key: 'threshold', width: 80 },
    { title: 'Thiếu', key: 'shortage', width: 80,
      render: (_: unknown, r: Product) => <Tag color='red'>-{Math.max(0, r.minThreshold - r.currentStock)}</Tag> },
  ]

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}
        items={[{ href: '/', title: <HomeOutlined /> }, { title: 'Thống kê báo cáo' }]} />

      <Title level={4} style={{ marginBottom: 20 }}>Thống kê & Báo cáo</Title>

      {/* KPI */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Tổng sản phẩm', value: summary?.totalProducts ?? 0, icon: <ShoppingOutlined />, color: PRIMARY, sub: 'mặt hàng' },
          { title: 'Sắp/Hết hàng', value: summary?.lowStockCount ?? 0, icon: <WarningOutlined />, color: '#faad14', sub: 'cần nhập' },
          { title: 'Doanh thu hôm nay', value: summary?.todayRevenue ?? 0, icon: <DollarOutlined />, color: '#52c41a', currency: true },
          { title: 'Lợi nhuận hôm nay', value: summary?.todayProfit ?? 0, icon: <ExportOutlined />, color: '#1677ff', currency: true },
        ].map((k, i) => (
          <Col xs={24} sm={12} xl={6} key={i}>
            <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }} loading={loadingSummary}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type='secondary' style={{ fontSize: 13 }}>{k.title}</Text>
                  {k.currency ? (
                    <div style={{ fontSize: 20, fontWeight: 700, color: k.color, margin: '4px 0' }}>{fmtCurrency(k.value)}</div>
                  ) : (
                    <Statistic value={k.value} suffix={<span style={{ fontSize: 12, color: '#aaa' }}>{(k as { sub?: string }).sub}</span>}
                      valueStyle={{ fontSize: 28, fontWeight: 700, color: k.color }} />
                  )}
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${k.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: k.color }}>
                  {k.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Tồn kho theo danh mục */}
        <Col xs={24} lg={12}>
          <Card title='Sản phẩm theo danh mục' style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', height: '100%' }}>
            {categories.length === 0 ? (
              <Text type='secondary'>Chưa có dữ liệu</Text>
            ) : (
              categories.map((c: Category) => (
                <BarRow key={c.id} label={c.name} value={c.items?.length ?? 0} max={maxStock} color={PRIMARY} />
              ))
            )}
          </Card>
        </Col>

        {/* Sản phẩm sắp hết */}
        <Col xs={24} lg={12}>
          <Card title='Sản phẩm sắp / hết hàng' style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', height: '100%' }}>
            <Table
              rowKey='id' size='small' loading={loadingLowStock}
              dataSource={lowStock.slice(0, 8)} pagination={false}
              columns={lowStockColumns}
              locale={{ emptyText: 'Tất cả sản phẩm đủ hàng' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Nhật ký hoạt động */}
      <Card title='Nhật ký hoạt động gần đây' style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <Table
          rowKey='id' loading={loadingLogs}
          columns={logColumns} dataSource={logs as AuditLog[]}
          size='small' bordered
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} bản ghi` }}
        />
      </Card>
    </div>
  )
}

export default ThongKePage
