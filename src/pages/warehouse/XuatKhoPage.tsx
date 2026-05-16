import { useState, useMemo, useRef, useEffect } from 'react'
import {
  App, Button, Card, Col, Divider, Form, Input,
  InputNumber, Modal, Row, Select, Space, Table, Tag, Tooltip, Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, DeleteOutlined, ExportOutlined, PrinterOutlined, StopOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useGetProductsQuery } from '@/features/product/productApi'
import { useCreateOrderMutation, useCancelOrderMutation } from '@/features/order/orderApi'
import { useLazyLookupCustomerQuery } from '@/features/customer/customerApi'
import type { OrderResponse, PaymentMethod } from '@/types/api'
import PageHeader from '@/components/shared/PageHeader'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay'
import { useLocaleFormat } from '@/utils/useLocaleFormat'

const { Title, Text } = Typography
const PRIMARY = '#E8603C'

interface CartRow {
  productId: number
  name: string
  priceExport: number
  quantity: number
  stock: number
}

const XuatKhoPage = () => {
  const { message, modal } = App.useApp()
  const { t } = useTranslation(['stock', 'common'])
  const { currency, dateTime } = useLocaleFormat()
  const [form] = Form.useForm()
  const [cart, setCart] = useState<CartRow[]>([])
  const [lastOrder, setLastOrder] = useState<OrderResponse | null>(null)
  const [printOpen, setPrintOpen] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const { data: products = [], isLoading: loadingProducts } = useGetProductsQuery()
  const [createOrder, { isLoading: submitting }] = useCreateOrderMutation()
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation()
  const [lookupCustomer, { isFetching: lookingUp }] = useLazyLookupCustomerQuery()

  const availableProducts = useMemo(
    () => products.filter((p) => p.currentStock > 0 && p.status === 'ACTIVE'),
    [products],
  )

  const addToCart = () => {
    const pid = form.getFieldValue('addProductId') as number | undefined
    if (!pid) return
    const p = products.find((x) => x.id === pid)
    if (!p) return
    if (cart.some((c) => c.productId === pid)) { void message.warning(t('export.cartAlreadyIn')); return }
    setCart((prev) => [...prev, { productId: p.id, name: p.name, priceExport: p.priceExport, quantity: 1, stock: p.currentStock }])
    form.setFieldValue('addProductId', undefined)
  }

  const updateQuantity = (productId: number, value: number | null) => {
    const row = cart.find((c) => c.productId === productId)
    if (!row) return
    const next = Math.max(1, value ?? 1)
    if (next > row.stock) {
      void message.warning(t('export.cartStockExceeded', { count: row.stock }))
    }
    setCart((prev) => prev.map((c) => (c.productId === productId ? { ...c, quantity: Math.min(next, row.stock) } : c)))
  }

  const total = cart.reduce((s, c) => s + c.priceExport * c.quantity, 0)

  const tryAutoFillCustomer = async (params: { phone?: string; email?: string }) => {
    if (!params.phone && !params.email) return
    try {
      const c = await lookupCustomer(params, true).unwrap()
      const current = form.getFieldsValue(['customerName', 'customerPhone', 'customerEmail', 'customerAddress'])
      form.setFieldsValue({
        customerName: current.customerName || c.fullName || '',
        customerPhone: current.customerPhone || c.phoneNumber || '',
        customerEmail: current.customerEmail || c.email || '',
        customerAddress: current.customerAddress || c.address || '',
      })
      void message.success(t('export.lookupFound', { name: c.fullName ?? c.phoneNumber }))
    } catch {
      // 404 means new customer — silent
    }
  }

  const phoneRef = useRef<string>('')
  const emailRef = useRef<string>('')
  useEffect(() => {
    const id = setTimeout(() => {
      const v = form.getFieldsValue(['customerPhone', 'customerEmail'])
      const phone = (v.customerPhone as string ?? '').trim()
      const email = (v.customerEmail as string ?? '').trim()
      if (phone && phone.length >= 8 && phone !== phoneRef.current) {
        phoneRef.current = phone
        void tryAutoFillCustomer({ phone })
      } else if (email && email.includes('@') && email !== emailRef.current) {
        emailRef.current = email
        void tryAutoFillCustomer({ email })
      }
    }, 500)
    return () => clearTimeout(id)
  })

  const handleSubmit = () => {
    form.validateFields(['customerName', 'customerPhone', 'paymentMethod']).then(async (values) => {
      if (cart.length === 0) { void message.error(t('export.validation.emptyCart')); return }
      for (const row of cart) {
        if (row.quantity > row.stock) {
          void message.error(t('export.cartStockOver', { name: row.name, count: row.stock }))
          return
        }
      }
      try {
        const order = await createOrder({
          customerName: values.customerName as string,
          customerPhone: values.customerPhone as string,
          customerEmail: values.customerEmail as string | undefined,
          customerAddress: values.customerAddress as string | undefined,
          paymentMethod: values.paymentMethod as PaymentMethod,
          items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity, selectImeis: [] })),
        }).unwrap()
        setLastOrder(order)
        void message.success(t('export.success'))
        setPrintOpen(true)
        form.resetFields(['customerName', 'customerPhone', 'customerEmail', 'customerAddress', 'paymentMethod'])
        phoneRef.current = ''
        emailRef.current = ''
        setCart([])
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? t('common:error.system'))
      }
    })
  }

  const handleCancelOrder = () => {
    if (!lastOrder) return
    modal.confirm({
      title: t('export.cancelConfirmTitle'),
      content: t('export.cancelConfirmContent', { id: lastOrder.id }),
      okText: t('export.cancelConfirmOk'),
      okButtonProps: { danger: true },
      cancelText: t('export.cancelConfirmCancel'),
      onOk: async () => {
        try {
          await cancelOrder(lastOrder.id).unwrap()
          void message.success(t('export.canceledSuccess'))
          setLastOrder(null)
        } catch (err: unknown) {
          const e = err as { data?: { message?: string } }
          void message.error(e?.data?.message ?? t('export.cancelFail'))
        }
      },
    })
  }

  const cartColumns: ColumnsType<CartRow> = [
    { title: t('export.cartColProduct'), dataIndex: 'name', key: 'name', ellipsis: true,
      render: (v: string, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{v}</div>
          <Text type='secondary' style={{ fontSize: 11 }}>{t('export.cartStockInfo', { count: r.stock })}</Text>
        </div>
      ),
    },
    { title: t('export.cartColPrice'), dataIndex: 'priceExport', key: 'price', width: 130, render: (v: number) => <CurrencyDisplay value={v} size='small' /> },
    {
      title: t('export.cartColQty'), key: 'qty', width: 130,
      render: (_, r) => (
        <Tooltip title={r.quantity >= r.stock ? t('export.cartStockMax', { count: r.stock }) : ''}>
          <InputNumber
            min={1}
            max={r.stock}
            value={r.quantity}
            style={{ width: 100 }}
            status={r.quantity >= r.stock ? 'warning' : ''}
            onChange={(v) => updateQuantity(r.productId, v as number | null)}
          />
        </Tooltip>
      ),
    },
    { title: t('export.cartColSum'), key: 'sum', width: 140, render: (_, r) => <CurrencyDisplay value={r.priceExport * r.quantity} color={PRIMARY} size='small' /> },
    {
      title: '', key: 'del', width: 50,
      render: (_, r) => <Button type='text' danger size='small' icon={<DeleteOutlined />} onClick={() => setCart((prev) => prev.filter((c) => c.productId !== r.productId))} />,
    },
  ]

  return (
    <div>
      <PageHeader title={t('export.title')} breadcrumb={[{ title: t('export.breadcrumb'), href: '/xuat-kho' }]} />

      {lastOrder && (
        <Card style={{ borderRadius: 12, background: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <Space>
              <Text strong style={{ color: '#52c41a' }}>{t('export.lastOrderTag', { id: lastOrder.id, customer: lastOrder.customerName })}</Text>
              <CurrencyDisplay value={lastOrder.totalAmount} color='#52c41a' />
              <Tag color={lastOrder.status === 'PENDING' ? 'gold' : lastOrder.status === 'COMPLETED' ? 'green' : 'red'}>
                {t(`export.statusConfig.${lastOrder.status}`, { defaultValue: lastOrder.status })}
              </Tag>
            </Space>
            <Space>
              <Button size='small' icon={<PrinterOutlined />} onClick={() => setPrintOpen(true)}>{t('export.viewSlip')}</Button>
              {lastOrder.status === 'PENDING' && (
                <Button size='small' danger icon={<StopOutlined />} loading={cancelling} onClick={handleCancelOrder}>{t('export.cancelOrder')}</Button>
              )}
              <Button type='text' size='small' onClick={() => setLastOrder(null)}>{t('common:button.close')}</Button>
            </Space>
          </div>
        </Card>
      )}

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
          <Card title={t('export.cartTitle')} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
            extra={
              <Space>
                <Select showSearch loading={loadingProducts} placeholder={t('export.cartProductSelect')} style={{ width: 280 }}
                  filterOption={(input, opt) => (opt?.label as string ?? '').toLowerCase().includes(input.toLowerCase())}
                  value={form.getFieldValue('addProductId')}
                  onChange={(v) => form.setFieldValue('addProductId', v)}
                  options={availableProducts.map((p) => ({ value: p.id, label: t('export.cartProductOption', { name: p.name, stock: p.currentStock }) }))}
                />
                <Button type='primary' icon={<PlusOutlined />} onClick={addToCart}>{t('export.cartAddButton')}</Button>
              </Space>
            }
          >
            <Form form={form}><Form.Item name='addProductId' hidden /></Form>
            <Table rowKey='productId' columns={cartColumns} dataSource={cart} pagination={false} size='small'
              locale={{ emptyText: t('export.cartEmpty') }} />
            {cart.length > 0 && (
              <div style={{ textAlign: 'right', marginTop: 16, padding: '12px 0', borderTop: '2px solid #f0f0f0' }}>
                <Text strong style={{ fontSize: 16 }}>{t('export.cartTotal')} </Text>
                <CurrencyDisplay value={total} color={PRIMARY} size='large' />
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title={t('export.customerCardTitle')} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <Form form={form} layout='vertical'>
              <Form.Item label={t('export.customerPhone')} name='customerPhone'
                tooltip={t('export.lookupHint')}
                rules={[{ required: true, message: t('export.customerPhoneRequired') }]}>
                <Input placeholder={t('export.customerPhonePlaceholder')} suffix={lookingUp ? <Text type='secondary' style={{ fontSize: 11 }}>{t('export.lookupSearching')}</Text> : null} />
              </Form.Item>
              <Form.Item label={t('export.customerEmail')} name='customerEmail'>
                <Input placeholder={t('export.customerEmailPlaceholder')} />
              </Form.Item>
              <Form.Item label={t('export.customerName')} name='customerName' rules={[{ required: true, message: t('export.customerNameRequired') }]}>
                <Input placeholder={t('export.customerNamePlaceholder')} />
              </Form.Item>
              <Form.Item label={t('export.customerAddress')} name='customerAddress'><Input.TextArea rows={2} /></Form.Item>
              <Form.Item label={t('export.paymentMethod')} name='paymentMethod' rules={[{ required: true, message: t('export.paymentMethodRequired') }]}>
                <Select options={[
                  { value: 'CASH', label: t('common:status.payment.CASH') },
                  { value: 'TRANSFER', label: t('common:status.payment.TRANSFER') },
                  { value: 'CARD', label: t('common:status.payment.CARD') }
                ]} />
              </Form.Item>
              <Divider />
              <div style={{ background: '#fafafa', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type='secondary'>{t('export.summaryItemCount')}</Text>
                  <Text>{t('export.summaryItemCountValue', { count: cart.length })}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>{t('export.summaryTotal')}</Text>
                  <CurrencyDisplay value={total} color={PRIMARY} size='large' />
                </div>
              </div>
              <Button type='primary' block size='large' loading={submitting}
                onClick={handleSubmit} icon={<ExportOutlined />} disabled={cart.length === 0}>
                {t('export.submit')}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>

      <Modal
        title={<Space><PrinterOutlined /><span>{t('export.printTitle', { id: lastOrder?.id ?? '' })}</span></Space>}
        open={printOpen} onCancel={() => setPrintOpen(false)} width={560}
        footer={[
          <Button key='print' type='primary' icon={<PrinterOutlined />} onClick={() => window.print()}>{t('export.printAction')}</Button>,
          <Button key='close' onClick={() => setPrintOpen(false)}>{t('export.printClose')}</Button>,
        ]}
      >
        {lastOrder && (
          <div ref={printRef} style={{ fontFamily: 'monospace', fontSize: 13 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0 }}>{t('export.slip.title')}</Title>
              <Text type='secondary'>{t('export.slip.system')}</Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ marginBottom: 8 }}><Text strong>{t('export.slip.orderNumber')}</Text> {lastOrder.id}</div>
            <div style={{ marginBottom: 8 }}><Text strong>{t('export.slip.customer')}</Text> {lastOrder.customerName}</div>
            <div style={{ marginBottom: 8 }}><Text strong>{t('export.slip.phone')}</Text> {lastOrder.customerPhone}</div>
            <div style={{ marginBottom: 8 }}><Text strong>{t('export.slip.payment')}</Text> {t(`common:status.payment.${lastOrder.paymentMethod}`, { defaultValue: lastOrder.paymentMethod })}</div>
            <div style={{ marginBottom: 8 }}><Text strong>{t('export.slip.date')}</Text> {dateTime(lastOrder.createdAt)}</div>
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 16 }}>
              {t('export.slip.total')} {currency(lastOrder.totalAmount)}
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'center' }}><div>{t('export.slip.staff')}</div><div style={{ marginTop: 40 }}>________________</div></div>
              <div style={{ textAlign: 'center' }}><div>{t('export.slip.customerSign')}</div><div style={{ marginTop: 40 }}>________________</div></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default XuatKhoPage
