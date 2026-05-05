import { useState, useMemo } from 'react'
import {
  App, Button, Card, Col, Descriptions, Drawer, Form, Input, Modal, Row,
  Select, Space, Statistic, Table, Tag, Tooltip, Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EyeOutlined, StopOutlined, ShoppingCartOutlined, RollbackOutlined } from '@ant-design/icons'
import PageHeader from '@/components/shared/PageHeader'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay'
import EmptyState from '@/components/shared/EmptyState'
import {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCancelOrderMutation,
  useReturnOrderMutation,
} from '@/features/order/orderApi'
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
  const [drawerOrderId, setDrawerOrderId] = useState<number | null>(null)
  const [returnTarget, setReturnTarget] = useState<OrderResponse | null>(null)
  const [returnForm] = Form.useForm<{ imeis: string; reason: string }>()

  const { data, isLoading, isError } = useGetOrdersQuery({
    page: page - 1,
    size: 20,
    status: filterStatus,
  })
  const { data: drawerOrder, isFetching: loadingDetail } = useGetOrderQuery(drawerOrderId!, {
    skip: drawerOrderId == null,
  })
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation()
  const [returnOrder, { isLoading: returning }] = useReturnOrderMutation()

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

  const openReturn = (order: OrderResponse) => {
    returnForm.resetFields()
    setReturnTarget(order)
  }

  const handleReturn = () => {
    returnForm.validateFields().then(async (values) => {
      if (!returnTarget) return
      const imeis = values.imeis
        .split(/[\s,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean)
      if (imeis.length === 0) {
        void message.error('Cần nhập ít nhất 1 IMEI để hoàn trả')
        return
      }
      try {
        await returnOrder({ id: returnTarget.id, imeis, reason: values.reason }).unwrap()
        void message.success(`Đã hoàn trả ${imeis.length} IMEI cho đơn #${returnTarget.id}`)
        setReturnTarget(null)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? 'Lỗi hệ thống')
      }
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
      title: 'Hành động', key: 'action', width: 130,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title='Xem chi tiết'>
            <Button type='text' size='small' icon={<EyeOutlined style={{ color: PRIMARY }} />}
              onClick={() => setDrawerOrderId(record.id)} />
          </Tooltip>
          {record.status === 'PENDING' && (
            <Tooltip title='Huỷ đơn'>
              <Button type='text' size='small' danger
                icon={<StopOutlined />}
                loading={cancelling}
                onClick={() => handleCancel(record.id, record.customerName)} />
            </Tooltip>
          )}
          {record.status === 'COMPLETED' && (
            <Tooltip title='Hoàn trả'>
              <Button type='text' size='small'
                icon={<RollbackOutlined style={{ color: '#faad14' }} />}
                onClick={() => openReturn(record)} />
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
        title={drawerOrder ? `Đơn hàng #${drawerOrder.id}` : `Đơn hàng #${drawerOrderId ?? ''}`}
        width={520} open={drawerOrderId != null} onClose={() => setDrawerOrderId(null)}
        loading={loadingDetail}
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
            <div style={{ marginTop: 20 }}>
              <Text strong>Chi tiết sản phẩm:</Text>
              {drawerOrder.items && drawerOrder.items.length > 0 ? (
                <Table
                  rowKey='id' size='small' style={{ marginTop: 8 }}
                  dataSource={drawerOrder.items} pagination={false}
                  columns={[
                    { title: 'Sản phẩm', dataIndex: 'productName', key: 'name', ellipsis: true },
                    { title: 'SL', dataIndex: 'quantity', key: 'qty', width: 55, align: 'right' },
                    { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'price', width: 120, align: 'right',
                      render: (v: number) => <CurrencyDisplay value={v} size='small' /> },
                    { title: 'Thành tiền', key: 'subTotal', width: 130, align: 'right',
                      render: (_, r) => <CurrencyDisplay value={r.unitPrice * r.quantity} size='small' /> },
                  ]}
                />
              ) : (
                <div style={{ marginTop: 8 }}><Text type='secondary'>Chưa có sản phẩm.</Text></div>
              )}
            </div>
          </>
        )}
      </Drawer>

      <Modal
        title={<Space><RollbackOutlined style={{ color: '#faad14' }} /><span>Hoàn trả đơn #{returnTarget?.id}</span></Space>}
        open={!!returnTarget} onCancel={() => setReturnTarget(null)}
        width={520}
        footer={[
          <Button key='c' onClick={() => setReturnTarget(null)}>Huỷ</Button>,
          <Button key='r' type='primary' danger loading={returning} onClick={handleReturn}>
            Xác nhận hoàn trả
          </Button>,
        ]}
      >
        <Form form={returnForm} layout='vertical'>
          <Form.Item
            label='Danh sách IMEI cần trả'
            name='imeis'
            extra='Mỗi IMEI cách nhau bằng dấu phẩy, dấu cách hoặc xuống dòng.'
            rules={[{ required: true, message: 'Nhập IMEI cần trả' }]}
          >
            <Input.TextArea rows={4} placeholder='IMEI1, IMEI2, ...' />
          </Form.Item>
          <Form.Item
            label='Lý do trả'
            name='reason'
            rules={[{ required: true, message: 'Nhập lý do trả hàng' }]}
          >
            <Input.TextArea rows={2} placeholder='VD: Khách đổi ý, lỗi kỹ thuật, ...' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default LichSuDonHangPage
