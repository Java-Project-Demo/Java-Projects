import { useState, useMemo } from 'react'
import {
  App, Button, Card, Col, Descriptions, Drawer, Form, Input, Modal, Row,
  Select, Space, Statistic, Table, Tag, Tooltip, Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EyeOutlined, StopOutlined, ShoppingCartOutlined, RollbackOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import PageHeader from '@/components/shared/PageHeader'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay'
import EmptyState from '@/components/shared/EmptyState'
import {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCancelOrderMutation,
  useReturnOrderMutation,
} from '@/features/order/orderApi'
import { useLocaleFormat } from '@/utils/useLocaleFormat'
import { useCan } from '@/utils/permissions'
import type { OrderResponse, OrderStatus, PaymentMethod } from '@/types/api'

const { Text } = Typography
const PRIMARY = '#E8603C'

const LichSuDonHangPage = () => {
  const { message, modal } = App.useApp()
  const { t } = useTranslation(['order', 'common'])
  const { dateTime } = useLocaleFormat()
  const canCancel = useCan('ORDER_CANCEL')
  const canReturn = useCan('ORDER_RETURN')
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

  const statusColor: Record<OrderStatus, string> = { PENDING: 'gold', COMPLETED: 'green', CANCELED: 'red' }

  const handleCancel = (id: number, customerName: string) => {
    modal.confirm({
      title: t('cancel.title'),
      content: t('cancel.content', { id, customer: customerName }),
      okText: t('cancel.okText'),
      okButtonProps: { danger: true },
      cancelText: t('cancel.cancelText'),
      onOk: async () => {
        try {
          await cancelOrder(id).unwrap()
          void message.success(t('cancel.success'))
        } catch (err: unknown) {
          const e = err as { data?: { message?: string } }
          void message.error(e?.data?.message ?? t('common:error.system'))
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
        void message.error(t('return.imeiNeedOne'))
        return
      }
      try {
        await returnOrder({ id: returnTarget.id, imeis, reason: values.reason }).unwrap()
        void message.success(t('return.success', { count: imeis.length, id: returnTarget.id }))
        setReturnTarget(null)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? t('common:error.system'))
      }
    })
  }

  const columns: ColumnsType<OrderResponse> = [
    { title: t('col.id'), dataIndex: 'id', key: 'id', width: 65 },
    {
      title: t('col.customer'), key: 'customer',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.customerName}</div>
          <Text type='secondary' style={{ fontSize: 12 }}>{r.customerPhone}</Text>
        </div>
      ),
    },
    {
      title: t('col.total'), dataIndex: 'totalAmount', key: 'total', width: 140,
      render: (v: number) => <CurrencyDisplay value={v} color={PRIMARY} />,
    },
    {
      title: t('col.payment'), dataIndex: 'paymentMethod', key: 'payment', width: 130,
      render: (v: PaymentMethod) => <Tag>{t(`common:status.payment.${v}`, { defaultValue: v })}</Tag>,
    },
    {
      title: t('col.status'), dataIndex: 'status', key: 'status', width: 130,
      render: (v: OrderStatus) => <Tag color={statusColor[v] ?? 'default'}>{t(`common:status.order.${v}`, { defaultValue: v })}</Tag>,
    },
    {
      title: t('col.createdAt'), dataIndex: 'createdAt', key: 'created', width: 140,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{dateTime(v)}</Text>,
    },
    {
      title: t('col.actions'), key: 'action', width: 130,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title={t('tooltip.viewDetail')}>
            <Button type='text' size='small' icon={<EyeOutlined style={{ color: PRIMARY }} />}
              onClick={() => setDrawerOrderId(record.id)} />
          </Tooltip>
          {canCancel && record.status === 'PENDING' && (
            <Tooltip title={t('tooltip.cancel')}>
              <Button type='text' size='small' danger
                icon={<StopOutlined />}
                loading={cancelling}
                onClick={() => handleCancel(record.id, record.customerName)} />
            </Tooltip>
          )}
          {canReturn && record.status === 'COMPLETED' && (
            <Tooltip title={t('tooltip.return')}>
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
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: t('stats.total'), value: stats.total, color: PRIMARY },
          { title: t('stats.pending'), value: stats.pending, color: '#faad14' },
          { title: t('stats.completed'), value: stats.completed, color: '#52c41a' },
          { title: t('stats.canceled'), value: stats.canceled, color: '#ff4d4f' },
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
            <Text strong>{t('revenueLabel')}</Text>
            <CurrencyDisplay value={stats.revenue} color='#52c41a' size='large' />
          </Space>
        </Card>
      )}

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
        title={<Space><ShoppingCartOutlined style={{ color: PRIMARY }} /><span>{t('listTitle')}</span></Space>}
        extra={
          <Select placeholder={t('filter.status')} allowClear style={{ width: 160 }}
            value={filterStatus} onChange={(v) => { setFilterStatus(v); setPage(1) }}
            options={['PENDING', 'COMPLETED', 'CANCELED'].map((v) => ({
              value: v, label: t(`common:status.order.${v}`, { defaultValue: v })
            }))}
          />
        }
      >
        {isError ? (
          <EmptyState title={t('empty.loading')} description={t('empty.loadingDesc')} />
        ) : (
          <Table
            rowKey='id' loading={isLoading} columns={columns} dataSource={orders}
            size='middle' bordered
            pagination={{
              current: page, total, pageSize: 20,
              onChange: setPage,
              showTotal: (total) => t('totalSuffix', { count: total }),
            }}
            locale={{ emptyText: <EmptyState title={t('empty.title')} /> }}
          />
        )}
      </Card>

      <Drawer
        title={drawerOrder ? t('drawer.title', { id: drawerOrder.id }) : t('drawer.title', { id: drawerOrderId ?? '' })}
        width={520} open={drawerOrderId != null} onClose={() => setDrawerOrderId(null)}
        loading={loadingDetail}
      >
        {drawerOrder && (
          <>
            <Tag color={statusColor[drawerOrder.status] ?? 'default'} style={{ marginBottom: 16 }}>
              {t(`common:status.order.${drawerOrder.status}`, { defaultValue: drawerOrder.status })}
            </Tag>
            <Descriptions bordered column={1} size='small'>
              <Descriptions.Item label={t('drawer.customer')}>{drawerOrder.customerName}</Descriptions.Item>
              <Descriptions.Item label={t('drawer.phone')}>{drawerOrder.customerPhone}</Descriptions.Item>
              <Descriptions.Item label={t('drawer.payment')}>{t(`common:status.payment.${drawerOrder.paymentMethod}`, { defaultValue: drawerOrder.paymentMethod })}</Descriptions.Item>
              <Descriptions.Item label={t('drawer.total')}>
                <CurrencyDisplay value={drawerOrder.totalAmount} color={PRIMARY} size='large' />
              </Descriptions.Item>
              <Descriptions.Item label={t('drawer.createdAt')}>{dateTime(drawerOrder.createdAt)}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 20 }}>
              <Text strong>{t('drawer.itemsHeader')}</Text>
              {drawerOrder.items && drawerOrder.items.length > 0 ? (
                <Table
                  rowKey='id' size='small' style={{ marginTop: 8 }}
                  dataSource={drawerOrder.items} pagination={false}
                  columns={[
                    { title: t('drawer.colProduct'), dataIndex: 'productName', key: 'name', ellipsis: true },
                    { title: t('drawer.colQty'), dataIndex: 'quantity', key: 'qty', width: 55, align: 'right' },
                    { title: t('drawer.colPrice'), dataIndex: 'unitPrice', key: 'price', width: 120, align: 'right',
                      render: (v: number) => <CurrencyDisplay value={v} size='small' /> },
                    { title: t('drawer.colSubtotal'), key: 'subTotal', width: 130, align: 'right',
                      render: (_, r) => <CurrencyDisplay value={r.unitPrice * r.quantity} size='small' /> },
                  ]}
                />
              ) : (
                <div style={{ marginTop: 8 }}><Text type='secondary'>{t('drawer.itemsEmpty')}</Text></div>
              )}
            </div>
          </>
        )}
      </Drawer>

      <Modal
        title={<Space><RollbackOutlined style={{ color: '#faad14' }} /><span>{t('return.title', { id: returnTarget?.id ?? '' })}</span></Space>}
        open={!!returnTarget} onCancel={() => setReturnTarget(null)}
        width={520}
        footer={[
          <Button key='c' onClick={() => setReturnTarget(null)}>{t('common:button.cancel')}</Button>,
          <Button key='r' type='primary' danger loading={returning} onClick={handleReturn}>
            {t('return.submit')}
          </Button>,
        ]}
      >
        <Form form={returnForm} layout='vertical'>
          <Form.Item
            label={t('return.imeiLabel')}
            name='imeis'
            extra={t('return.imeiExtra')}
            rules={[{ required: true, message: t('return.imeiRequired') }]}
          >
            <Input.TextArea rows={4} placeholder={t('return.imeiPlaceholder')} />
          </Form.Item>
          <Form.Item
            label={t('return.reason')}
            name='reason'
            rules={[{ required: true, message: t('return.reasonRequired') }]}
          >
            <Input.TextArea rows={2} placeholder={t('return.reasonPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default LichSuDonHangPage
