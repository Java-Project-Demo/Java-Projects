import { useState, useMemo } from 'react'
import {
  App, Breadcrumb, Button, Card, Col, Divider, Form, Input,
  InputNumber, Row, Select, Space, Table, Tag, Typography,
} from 'antd'
import { HomeOutlined, PlusOutlined, DeleteOutlined, ExportOutlined, MinusCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useGetProductsQuery } from '@/features/product/productApi'
import { useCreateOrderMutation } from '@/features/order/orderApi'
import type { OrderResponse, PaymentMethod, Product } from '@/types/api'

const { Title, Text } = Typography
const PRIMARY = '#E8603C'

const fmtCurrency = (v: number) =>
  (v ?? 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

interface CartRow {
  productId: number
  name: string
  priceExport: number
  quantity: number
  selectImeis: string[]
  hasImei: boolean
  imeiInput: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xuất', color: 'gold' },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
  CANCELED: { label: 'Đã huỷ', color: 'red' },
}

const XuatKhoPage = () => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [cart, setCart] = useState<CartRow[]>([])
  const [lastOrder, setLastOrder] = useState<OrderResponse | null>(null)

  const { data: products = [], isLoading: loadingProducts } = useGetProductsQuery()
  const [createOrder, { isLoading: submitting }] = useCreateOrderMutation()

  const availableProducts = useMemo(
    () => products.filter((p) => p.currentStock > 0 && p.status === 'ACTIVE'),
    [products],
  )

  const addToCart = () => {
    const pid = form.getFieldValue('addProductId') as number | undefined
    if (!pid) return
    const p = products.find((x) => x.id === pid)
    if (!p) return
    if (cart.some((c) => c.productId === pid)) {
      void message.warning('Sản phẩm đã có trong giỏ')
      return
    }
    setCart((prev) => [
      ...prev,
      { productId: p.id, name: p.name, priceExport: p.priceExport, quantity: 1, selectImeis: [], hasImei: !!p.hasImei, imeiInput: '' },
    ])
    form.setFieldValue('addProductId', undefined)
  }

  const updateCart = (productId: number, field: keyof CartRow, value: unknown) => {
    setCart((prev) => prev.map((c) => (c.productId === productId ? { ...c, [field]: value } : c)))
  }

  const addImeiToRow = (productId: number) => {
    const row = cart.find((c) => c.productId === productId)
    if (!row) return
    const imei = row.imeiInput.trim()
    if (!imei) return
    if (row.selectImeis.includes(imei)) { void message.warning('IMEI đã được thêm'); return }
    updateCart(productId, 'selectImeis', [...row.selectImeis, imei])
    updateCart(productId, 'imeiInput', '')
  }

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId))
  }

  const total = cart.reduce((s, c) => s + c.priceExport * c.quantity, 0)

  const handleSubmit = () => {
    form.validateFields(['customerName', 'customerPhone', 'paymentMethod']).then(async (values) => {
      if (cart.length === 0) { void message.error('Giỏ hàng trống'); return }
      for (const row of cart) {
        if (row.hasImei && row.selectImeis.length === 0) {
          void message.error(`Sản phẩm "${row.name}" cần nhập IMEI`); return
        }
        if (row.hasImei && row.selectImeis.length !== row.quantity) {
          void message.error(`Sản phẩm "${row.name}": số lượng và số IMEI phải bằng nhau`); return
        }
      }
      try {
        const order = await createOrder({
          customerName: values.customerName as string,
          customerPhone: values.customerPhone as string,
          customerEmail: values.customerEmail as string | undefined,
          customerAddress: values.customerAddress as string | undefined,
          paymentMethod: values.paymentMethod as PaymentMethod,
          items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity, selectImeis: c.selectImeis })),
        }).unwrap()
        setLastOrder(order)
        void message.success('Tạo đơn xuất kho thành công!')
        form.resetFields(['customerName', 'customerPhone', 'customerEmail', 'customerAddress', 'paymentMethod'])
        setCart([])
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? 'Lỗi hệ thống')
      }
    })
  }

  const cartColumns: ColumnsType<CartRow> = [
    { title: 'Sản phẩm', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: 'Đơn giá', dataIndex: 'priceExport', key: 'price', width: 130, render: (v: number) => fmtCurrency(v) },
    {
      title: 'Số lượng', key: 'qty', width: 110,
      render: (_, r) => (
        <InputNumber min={1} value={r.quantity} style={{ width: 80 }}
          onChange={(v) => updateCart(r.productId, 'quantity', v ?? 1)} />
      ),
    },
    {
      title: 'IMEI', key: 'imei', width: 200,
      render: (_, r) =>
        r.hasImei ? (
          <div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              <Input size='small' placeholder='Nhập IMEI' value={r.imeiInput}
                onChange={(e) => updateCart(r.productId, 'imeiInput', e.target.value)}
                onPressEnter={() => addImeiToRow(r.productId)} style={{ flex: 1 }} />
              <Button size='small' icon={<PlusOutlined />} onClick={() => addImeiToRow(r.productId)} />
            </div>
            {r.selectImeis.map((imei) => (
              <Tag key={imei} closable onClose={() => updateCart(r.productId, 'selectImeis', r.selectImeis.filter((i) => i !== imei))}
                style={{ marginBottom: 2, fontSize: 11 }}>
                {imei}
              </Tag>
            ))}
          </div>
        ) : <Text type='secondary' style={{ fontSize: 12 }}>Không cần IMEI</Text>,
    },
    { title: 'Thành tiền', key: 'sum', width: 130, render: (_, r) => fmtCurrency(r.priceExport * r.quantity) },
    {
      title: '', key: 'del', width: 50,
      render: (_, r) => (
        <Button type='text' danger size='small' icon={<DeleteOutlined />} onClick={() => removeFromCart(r.productId)} />
      ),
    },
  ]

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}
        items={[{ href: '/', title: <HomeOutlined /> }, { title: 'Xuất kho' }]} />

      <Title level={4} style={{ marginBottom: 20 }}>
        <ExportOutlined style={{ color: PRIMARY, marginRight: 8 }} />Xuất kho / Tạo đơn bán
      </Title>

      {lastOrder && (
        <Card style={{ borderRadius: 12, background: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: 20 }}>
          <Text strong style={{ color: '#52c41a' }}>
            ✓ Đơn hàng #{lastOrder.id} — Khách: {lastOrder.customerName} — Tổng: {fmtCurrency(lastOrder.totalAmount)}
          </Text>
          <Tag color={STATUS_CONFIG[lastOrder.status]?.color ?? 'default'} style={{ marginLeft: 12 }}>
            {STATUS_CONFIG[lastOrder.status]?.label ?? lastOrder.status}
          </Tag>
          <Button type='link' size='small' onClick={() => setLastOrder(null)} style={{ float: 'right' }}>Đóng</Button>
        </Card>
      )}

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
          <Card title='Giỏ hàng' style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
            extra={
              <Space>
                <Select showSearch loading={loadingProducts} placeholder='Chọn sản phẩm để thêm'
                  style={{ width: 260 }}
                  filterOption={(input, opt) => (opt?.label as string ?? '').toLowerCase().includes(input.toLowerCase())}
                  value={form.getFieldValue('addProductId')}
                  onChange={(v) => form.setFieldValue('addProductId', v)}
                  options={availableProducts.map((p) => ({ value: p.id, label: `${p.name} (còn ${p.currentStock})` }))}
                />
                <Button type='primary' icon={<PlusOutlined />} onClick={addToCart}>Thêm</Button>
              </Space>
            }
          >
            <Form form={form}>
              <Form.Item name='addProductId' hidden />
              <Table
                rowKey='productId' columns={cartColumns} dataSource={cart}
                pagination={false} size='small'
                locale={{ emptyText: 'Chưa có sản phẩm trong giỏ hàng' }}
              />
              {cart.length > 0 && (
                <div style={{ textAlign: 'right', marginTop: 16, padding: '12px 0', borderTop: '2px solid #f0f0f0' }}>
                  <Text strong style={{ fontSize: 16 }}>Tổng cộng: </Text>
                  <Text strong style={{ fontSize: 20, color: PRIMARY }}>{fmtCurrency(total)}</Text>
                </div>
              )}
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title='Thông tin khách hàng & Thanh toán' style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <Form form={form} layout='vertical'>
              <Form.Item label='Tên khách hàng' name='customerName' rules={[{ required: true, message: 'Nhập tên khách hàng' }]}>
                <Input placeholder='Nguyễn Văn A' />
              </Form.Item>
              <Form.Item label='Số điện thoại' name='customerPhone' rules={[{ required: true, message: 'Nhập số điện thoại' }]}>
                <Input placeholder='09xxxxxxxx' />
              </Form.Item>
              <Form.Item label='Email' name='customerEmail'>
                <Input placeholder='email@example.com' />
              </Form.Item>
              <Form.Item label='Địa chỉ' name='customerAddress'>
                <Input.TextArea rows={2} placeholder='Địa chỉ giao hàng (không bắt buộc)' />
              </Form.Item>
              <Form.Item label='Phương thức thanh toán' name='paymentMethod' rules={[{ required: true, message: 'Chọn phương thức' }]}>
                <Select options={[
                  { value: 'CASH', label: 'Tiền mặt' },
                  { value: 'TRANSFER', label: 'Chuyển khoản' },
                  { value: 'CARD', label: 'Thẻ' },
                ]} />
              </Form.Item>
              <Divider />

              <div style={{ background: '#fafafa', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type='secondary'>Số mặt hàng</Text>
                  <Text>{cart.length} loại</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Tổng cộng</Text>
                  <Text strong style={{ color: PRIMARY, fontSize: 16 }}>{fmtCurrency(total)}</Text>
                </div>
              </div>

              <Button type='primary' block size='large' loading={submitting}
                onClick={handleSubmit} icon={<ExportOutlined />} disabled={cart.length === 0}>
                Xác nhận xuất kho
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Gợi ý sản phẩm có hàng */}
      <Card title='Sản phẩm có thể xuất' style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginTop: 20 }}>
        <Table
          rowKey='id' size='small'
          dataSource={availableProducts.slice(0, 10)} pagination={false}
          columns={[
            { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name', ellipsis: true },
            { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 110 },
            { title: 'Tồn kho', dataIndex: 'currentStock', key: 'stock', width: 90,
              render: (v: number, r: Product) => <Text style={{ color: v < r.minThreshold ? '#faad14' : '#52c41a', fontWeight: 700 }}>{v}</Text> },
            { title: 'Giá xuất', dataIndex: 'priceExport', key: 'price', width: 130, render: (v: number) => fmtCurrency(v) },
            {
              title: '', key: 'add', width: 80,
              render: (_, r: Product) => (
                <Button size='small' icon={<MinusCircleOutlined rotate={45} />}
                  onClick={() => {
                    if (cart.some((c) => c.productId === r.id)) { void message.info('Đã có trong giỏ'); return }
                    setCart((prev) => [...prev, { productId: r.id, name: r.name, priceExport: r.priceExport, quantity: 1, selectImeis: [], hasImei: !!r.hasImei, imeiInput: '' }])
                  }}>
                  Thêm
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}

export default XuatKhoPage
