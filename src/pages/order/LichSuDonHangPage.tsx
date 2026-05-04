import { useState, useMemo } from 'react'
import {
  App, Button, Card, Col, Descriptions, Drawer, Row,
  Select, Space, Statistic, Table, Tag, Tooltip, Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EyeOutlined, StopOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import PageHeader from '@/components/shared/PageHeader'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay'
import EmptyState from '@/components/shared/EmptyState'
import { useGetOrdersQuery, useCancelOrderMutation } from '@/features/order/orderApi'
import type { OrderResponse, OrderStatus, PaymentMethod } from '@/types/api'

const { Text } = Typography
const PRIMARY = '#E8603C'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  PENDING:   { label: 'Chờ xử lý',  color: 'gold' },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
  CANCELED:  { label: 'Đã huỷ',     color: 'red' },
}

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  CASH:     'Tiền mặt',
  TRANSFER: 'Chuyển khoản',
  CARD:     'Thẻ',
}

const LichSuDonHangPage = () => {
  const { message, modal } = App.useApp()
  const [filterStatus, setFilterStatus] = useState<OrderStatus | undefined>()
  const [page, setPage] = useState(1)
  const [drawerOrder, setDrawerOrder] = useState<OrderResponse | null>(null)

  const { data, isLoading, isError } = useGetOrdersQuery({
    page: page - 1,
    size: 20,
    status: filterStatus,
  })
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation()

  const orders = data?.content ?? []
  const total = data?.pagination?.totalElements ?? 0

  const stats = useMemo(() => {
    const all = orders
    return {
      total: data?.pagination?.totalElements ?? 0,
      pending: all.filter((o) => o.status === 'PENDING').length,
      completed: all.filter((o) => o.status === 'COMPLETED').length,
      canceled: all.filter((o) => o.status === 'CANCELED').length,
      revenue: all.filter((o) => o.status === 'COMPLETED').reduce((s, o) => s + o.totalAmount, 0),
    }
  }, [orders, data])

  const handleCancel = (id: number, customerName: string) => {
    modal.confirm({
      title: 'Xác nhận huỷ đơn',
      content: `Huỷ đơn hàng #${id} của khách ${customerName}?`,
      okText: 'Huỷ đơn', okButtonProps: { danger: true },
      cancelText: 'Không',
      onOk: async () => {
        try {
          await cancelOrder(id).unwrap()
          void message.success('Đã huỷ đơn hàng!')
        } catch (err: unknown) {
          const e = err as { data?: { message?: string } }
          void message.error(e?.data?.message ?? 'Lỗi hệ thống')
        }
      },
    })
  }

  const columns: ColumnsType<OrderResponse> = [
    { title: '#', dataIndex: 'id', key: 'id', width: 65 },
    {
      title: 'Khách hàng', key: 'customer',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.customerName}</div>
          <Text type='secondary' style={{ fontSize: 12 }}>{r.customerPhone}</Text>
        </div>
      ),
    },
    {
      title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'total', width: 140,
      render: (v: number) => <CurrencyDisplay value={v} color={PRIMARY} />,
    },
    {
      title: 'Thanh toán', dataIndex: 'paymentMethod', key: 'payment', width: 130,
      render: (v: PaymentMethod) => <Tag>{PAYMENT_LABEL[v] ?? v}</Tag>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
      render: (v: OrderStatus) => {
        const cfg = STATUS_CONFIG[v] ?? { label: v, color: 'default' }
        return <Tag color={cfg.color}>{cfg.label}</Tag>
      },
    },
    {
      title: 'Ngày tạo', dataIndex: 'createdAt', key: 'created', width: 140,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v ? new Date(v).toLocaleString('vi-VN') : '—'}</Text>,
    },
    {
      title: 'Hành động', key: 'action', width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title='Xem chi tiết'>
            <Button type='text' size='small' icon={<EyeOutlined style={{ color: PRIMARY }} />}
              onClick={() => setDrawerOrder(record)} />
          </Tooltip>
          {record.status === 'PENDING' && (
            <Tooltip title='Huỷ đơn'>
              <Button type='text' size='small' danger
                icon={<StopOutlined />}
                loading={cancelling}
                onClick={() => handleCancel(record.id, record.customerName)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title='Lịch sử đơn hàng' subtitle='Theo dõi tất cả các đơn xuất kho' />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Tổng đơn', value: stats.total, color: PRIMARY },
          { title: 'Chờ xử lý', value: stats.pending, color: '#faad14' },
          { title: 'Hoàn thành', value: stats.completed, color: '#52c41a' },
          { title: 'Đã huỷ', value: stats.canceled, color: '#ff4d4f' },
        ].map((s, i) => (
          <Col xs={12} xl={6} key={i}>
            <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <Statistic title={s.title} value={s.value} valueStyle={{ color: s.color, fontWeight: 700 }} />
            </Card>
          </Col>
        ))}
      </Row>

      {stats.revenue > 0 && (
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 20, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
          <Space>
            <Text strong>Doanh thu (đơn hoàn thành):</Text>
            <CurrencyDisplay value={stats.revenue} color='#52c41a' size='large' />
          </Space>
        </Card>
      )}

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
        title={<Space><ShoppingCartOutlined style={{ color: PRIMARY }} /><span>Danh sách đơn hàng</span></Space>}
        extra={
          <Select placeholder='Lọc trạng thái' allowClear style={{ width: 160 }}
            value={filterStatus} onChange={(v) => { setFilterStatus(v); setPage(1) }}
            options={Object.entries(STATUS_CONFIG).map(([v, { label }]) => ({ value: v, label }))}
          />
        }
      >
        {isError ? (
          <EmptyState title='Chức năng đang cập nhật' description='Endpoint lấy danh sách đơn hàng chưa sẵn sàng. Vui lòng thử lại sau.' />
        ) : (
          <Table
            rowKey='id' loading={isLoading} columns={columns} dataSource={orders}
            size='middle' bordered
            pagination={{
              current: page, total, pageSize: 20,
              onChange: setPage,
              showTotal: (t) => `Tổng ${t} đơn hàng`,
            }}
            locale={{ emptyText: <EmptyState title='Chưa có đơn hàng nào' /> }}
          />
        )}
      </Card>

      <Drawer
        title={drawerOrder ? `Đơn hàng #${drawerOrder.id}` : ''}
        width={480} open={!!drawerOrder} onClose={() => setDrawerOrder(null)}
      >
        {drawerOrder && (
          <>
            <Tag color={STATUS_CONFIG[drawerOrder.status]?.color ?? 'default'} style={{ marginBottom: 16 }}>
              {STATUS_CONFIG[drawerOrder.status]?.label ?? drawerOrder.status}
            </Tag>
            <Descriptions bordered column={1} size='small'>
              <Descriptions.Item label='Khách hàng'>{drawerOrder.customerName}</Descriptions.Item>
              <Descriptions.Item label='Số điện thoại'>{drawerOrder.customerPhone}</Descriptions.Item>
              <Descriptions.Item label='Thanh toán'>{PAYMENT_LABEL[drawerOrder.paymentMethod] ?? drawerOrder.paymentMethod}</Descriptions.Item>
              <Descriptions.Item label='Tổng tiền'>
                <CurrencyDisplay value={drawerOrder.totalAmount} color={PRIMARY} size='large' />
              </Descriptions.Item>
              <Descriptions.Item label='Ngày tạo'>{new Date(drawerOrder.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
            </Descriptions>
            {drawerOrder.items && drawerOrder.items.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <Text strong>Chi tiết sản phẩm:</Text>
                <Table
                  rowKey='id' size='small' style={{ marginTop: 8 }}
                  dataSource={drawerOrder.items} pagination={false}
                  columns={[
                    { title: 'Sản phẩm', dataIndex: 'productName', key: 'name', ellipsis: true },
                    { title: 'SL', dataIndex: 'quantity', key: 'qty', width: 55 },
                    { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'price', width: 120,
                      render: (v: number) => <CurrencyDisplay value={v} size='small' /> },
                  ]}
                />
              </div>
            )}
          </>
        )}
      </Drawer>
    </div>
  )
}

export default LichSuDonHangPage
