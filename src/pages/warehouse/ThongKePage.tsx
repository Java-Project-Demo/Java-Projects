import { useState } from 'react'
import {
  Breadcrumb, Card, Col, DatePicker, Row, Select, Statistic, Table, Tag, Typography,
} from 'antd'
import { HomeOutlined, ShoppingOutlined, WarningOutlined, DollarOutlined, ExportOutlined } from '@ant-design/icons'
import { useGetDashboardSummaryQuery, useGetLowStockQuery } from '@/features/dashboard/dashboardApi'
import { useGetCategoriesQuery } from '@/features/category/categoryApi'
import { useGetProductsQuery } from '@/features/product/productApi'
import { useGetAuditLogsQuery } from '@/features/auditLog/auditLogApi'
import type { AuditLog, Category, Product } from '@/types/api'
import TonKhoCuPage from '@/pages/report/TonKhoCuPage'

const { Text } = Typography
const { RangePicker } = DatePicker
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
  const [activeTab, setActiveTab] = useState('overview')
  const [filterAction, setFilterAction] = useState<string | undefined>()
  const [filterLogStatus, setFilterLogStatus] = useState<string | undefined>()

  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummaryQuery()
  const { data: lowStock = [], isLoading: loadingLowStock } = useGetLowStockQuery()
  const { data: categories = [] } = useGetCategoriesQuery()
  const { data: products = [] } = useGetProductsQuery()
  const { data: logs = [], isLoading: loadingLogs } = useGetAuditLogsQuery({ page: 0, size: 50 })

  // Tổng tồn kho theo danh mục (currentStock thực)
  const catStockMap = categories.map((c: Category) => ({
    ...c,
    totalStock: products.filter((p: Product) => p.categoryId === c.id).reduce((s, p) => s + p.currentStock, 0),
  }))
  const maxStock = Math.max(...catStockMap.map((c) => c.totalStock), 1)

  const filteredLogs = (logs as AuditLog[]).filter((l) => {
    const ma = !filterAction || l.action?.includes(filterAction)
    const ms = !filterLogStatus || l.status === filterLogStatus
    return ma && ms
  })

  const ACTION_OPTIONS = [
    { value: 'CREATE', label: 'Tạo mới' },
    { value: 'UPDATE', label: 'Cập nhật' },
    { value: 'DELETE', label: 'Xoá' },
    { value: 'IMPORT', label: 'Nhập kho' },
    { value: 'ORDER', label: 'Xuất kho/Đơn hàng' },
  ]

  const logColumns = [
    { title: 'Thời gian', dataIndex: 'createdAt', key: 'time', width: 150,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v ? new Date(v).toLocaleString('vi-VN') : '—'}</Text> },
    { title: 'Người thực hiện', dataIndex: 'userId', key: 'user', width: 130,
      render: (v: number) => <Tag>ID #{v}</Tag> },
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

  const tabItems = [
    {
      key: 'overview', label: 'Tổng quan',
      children: (
        <>
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
                      {(k as { currency?: boolean }).currency
                        ? <div style={{ fontSize: 20, fontWeight: 700, color: k.color, margin: '4px 0' }}>{fmtCurrency(k.value)}</div>
                        : <Statistic value={k.value} suffix={<span style={{ fontSize: 12, color: '#aaa' }}>{(k as { sub?: string }).sub}</span>} valueStyle={{ fontSize: 28, fontWeight: 700, color: k.color }} />}
                    </div>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: `${k.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: k.color }}>{k.icon}</div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title='Tồn kho theo danh mục' style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
                {catStockMap.length === 0
                  ? <Text type='secondary'>Chưa có dữ liệu</Text>
                  : catStockMap.map((c) => (
                    <BarRow key={c.id} label={c.name} value={c.totalStock} max={maxStock} color={PRIMARY} />
                  ))}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title='Sản phẩm sắp / hết hàng' style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
                <Table rowKey='id' size='small' loading={loadingLowStock}
                  dataSource={lowStock.slice(0, 8)} pagination={false} columns={lowStockColumns}
                  locale={{ emptyText: 'Tất cả sản phẩm đủ hàng' }} />
              </Card>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: 'logs', label: 'Nhật ký hoạt động',
      children: (
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <Select placeholder='Loại hành động' allowClear style={{ width: 180 }}
              value={filterAction} onChange={setFilterAction} options={ACTION_OPTIONS} />
            <Select placeholder='Trạng thái' allowClear style={{ width: 130 }}
              value={filterLogStatus} onChange={setFilterLogStatus}
              options={[{ value: 'SUCCESS', label: 'Thành công' }, { value: 'FAILED', label: 'Thất bại' }]} />
            <RangePicker placeholder={['Từ ngày', 'Đến ngày']} style={{ width: 240 }} />
          </div>
          <Table rowKey='id' loading={loadingLogs} columns={logColumns} dataSource={filteredLogs}
            size='small' bordered
            pagination={{ pageSize: 15, showTotal: (t) => `Tổng ${t} bản ghi` }} />
        </Card>
      ),
    },
    {
      key: 'aging', label: 'Tồn kho cũ',
      children: <TonKhoCuPage />,
    },
  ]

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}
        items={[{ href: '/', title: <HomeOutlined /> }, { title: 'Thống kê báo cáo' }]} />

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
        tabList={tabItems.map((t) => ({ key: t.key, tab: t.label }))}
        activeTabKey={activeTab}
        onTabChange={setActiveTab}
        bodyStyle={{ paddingTop: 16 }}
      >
        {tabItems.find((t) => t.key === activeTab)?.children}
      </Card>
    </div>
  )
}

export default ThongKePage
