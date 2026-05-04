import { useState } from 'react'
import {
  App, Button, Card, Col, Descriptions, Divider, Form,
  Input, InputNumber, Modal, Row, Select, Space, Table, Tag, Typography,
} from 'antd'
import { PlusOutlined, ImportOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons'
import { useGetProductsQuery } from '@/features/product/productApi'
import { useImportImeiMutation } from '@/features/stock/stockApi'
import { useGetSuppliersQuery, useCreateSupplierMutation } from '@/features/supplier/supplierApi'
import type { Product, SupplierRequest } from '@/types/api'
import PageHeader from '@/components/shared/PageHeader'

const { Text } = Typography
const PRIMARY = '#E8603C'

interface FormValues {
  productId: number
  costPrice: number
  supplierId: string
  imeiList: string[]
}

const NhapKhoPage = () => {
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const [quickAddForm] = Form.useForm<SupplierRequest>()
  const [imeiInput, setImeiInput] = useState('')
  const [imeiList, setImeiList] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [result, setResult] = useState<{ name: string; count: number; imeis: string[] } | null>(null)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const { data: products = [], isLoading: loadingProducts } = useGetProductsQuery()
  const { data: suppliers = [], isLoading: loadingSuppliers } = useGetSuppliersQuery()
  const [importImei, { isLoading: importing }] = useImportImeiMutation()
  const [createSupplier, { isLoading: creatingSupplier }] = useCreateSupplierMutation()

  const allProducts = products
  const supplierOptions = [
    ...suppliers.map((s) => ({ value: s.name, label: s.name })),
    { value: '__add__', label: '+ Thêm nhà cung cấp mới...' },
  ]

  const handleAddImei = () => {
    const trimmed = imeiInput.trim()
    if (!trimmed) return
    if (imeiList.includes(trimmed)) { void message.warning('IMEI này đã được thêm'); return }
    setImeiList((prev) => [...prev, trimmed])
    setImeiInput('')
  }

  const handleProductChange = (id: number) => {
    const p = allProducts.find((p) => p.id === id) ?? null
    setSelectedProduct(p)
    if (!p?.hasImei) setImeiList([])
  }

  const handleSupplierChange = (v: string) => {
    if (v === '__add__') {
      form.setFieldValue('supplierId', undefined)
      quickAddForm.resetFields()
      setQuickAddOpen(true)
    }
  }

  const handleQuickAddSupplier = () => {
    quickAddForm.validateFields().then(async (values) => {
      try {
        const created = await createSupplier(values).unwrap()
        void message.success('Thêm nhà cung cấp thành công!')
        form.setFieldValue('supplierId', created.name)
        setQuickAddOpen(false)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? 'Lỗi hệ thống')
      }
    })
  }

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      if (Number(values.costPrice) <= 0) { void message.error('Giá nhập phải lớn hơn 0'); return }
      const product = allProducts.find((p) => p.id === values.productId)
      if (product?.hasImei && imeiList.length === 0) {
        void message.error('Sản phẩm có IMEI cần nhập ít nhất 1 IMEI')
        return
      }
      try {
        await importImei({
          productId: values.productId,
          costPrice: values.costPrice,
          supplier: values.supplierId,
          imeiList: product?.hasImei ? imeiList : [],
        }).unwrap()
        setResult({ name: product?.name ?? '', count: product?.hasImei ? imeiList.length : 1, imeis: product?.hasImei ? [...imeiList] : [] })
        void message.success('Nhập kho thành công!')
        form.resetFields()
        setImeiList([])
        setSelectedProduct(null)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? 'Lỗi hệ thống')
      }
    })
  }

  return (
    <div>
      <PageHeader title='Nhập kho' breadcrumb={[{ title: 'Nhập kho', href: '/nhap-kho' }]} />

      {result && (
        <Card style={{ borderRadius: 12, background: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <Text strong style={{ color: '#52c41a', fontSize: 15 }}>
                ✓ Nhập kho thành công: <strong>{result.name}</strong> — {result.count} đơn vị
              </Text>
              {result.imeis.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Text type='secondary' style={{ fontSize: 12 }}>Danh sách IMEI đã nhập:</Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                    {result.imeis.map((imei) => (
                      <Tag key={imei} color='green' icon={<ImportOutlined />}>{imei}</Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button type='text' size='small' onClick={() => setResult(null)}>Đóng</Button>
          </div>
        </Card>
      )}

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
          <Card title='Thông tin nhập kho' style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <Form form={form} layout='vertical'>
              <Form.Item label='Sản phẩm' name='productId' rules={[{ required: true, message: 'Chọn sản phẩm' }]}>
                <Select
                  showSearch loading={loadingProducts} placeholder='Chọn sản phẩm cần nhập'
                  filterOption={(input, opt) => (opt?.label as string ?? '').toLowerCase().includes(input.toLowerCase())}
                  onChange={handleProductChange}
                  options={allProducts.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
                />
              </Form.Item>

              {selectedProduct && (
                <Card size='small' style={{ marginBottom: 16, background: '#fafafa' }}>
                  <Descriptions size='small' column={2}>
                    <Descriptions.Item label='SKU'>{selectedProduct.sku}</Descriptions.Item>
                    <Descriptions.Item label='Tồn kho hiện tại'>{selectedProduct.currentStock}</Descriptions.Item>
                    <Descriptions.Item label='Ngưỡng cảnh báo'>{selectedProduct.minThreshold}</Descriptions.Item>
                    <Descriptions.Item label='Theo IMEI'>
                      <Tag color={selectedProduct.hasImei ? 'blue' : 'default'}>{selectedProduct.hasImei ? 'Có' : 'Không'}</Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label='Giá nhập' name='costPrice' rules={[{ required: true, message: 'Nhập giá nhập' }, { type: 'number', min: 1, message: 'Giá nhập phải > 0' }]}>
                    <InputNumber style={{ width: '100%' }} min={0} addonAfter='₫'
                      formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} placeholder='0' />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label='Nhà cung cấp' name='supplierId' rules={[{ required: true, message: 'Chọn nhà cung cấp' }]}>
                    <Select
                      showSearch loading={loadingSuppliers} placeholder='Chọn nhà cung cấp'
                      filterOption={(input, opt) => (opt?.label as string ?? '').toLowerCase().includes(input.toLowerCase())}
                      onChange={handleSupplierChange}
                      options={supplierOptions}
                      optionRender={(opt) => (
                        opt.value === '__add__'
                          ? <span style={{ color: PRIMARY }}><ShopOutlined /> {opt.label}</span>
                          : <span>{opt.label as string}</span>
                      )}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {selectedProduct?.hasImei && (
                <>
                  <Divider orientation='left' style={{ fontSize: 13 }}>Danh sách IMEI</Divider>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <Input
                      placeholder='Nhập IMEI và nhấn Thêm (hoặc Enter)'
                      value={imeiInput}
                      onChange={(e) => setImeiInput(e.target.value)}
                      onPressEnter={handleAddImei}
                      style={{ flex: 1 }}
                    />
                    <Button icon={<PlusOutlined />} onClick={handleAddImei}>Thêm</Button>
                  </div>
                  {imeiList.length > 0 ? (
                    <Table
                      rowKey={(r) => r} size='small'
                      dataSource={imeiList}
                      pagination={false}
                      columns={[
                        { title: `IMEI (${imeiList.length})`, key: 'imei', render: (_: unknown, r: string) => <Text code>{r}</Text> },
                        {
                          title: '', key: 'del', width: 50,
                          render: (_: unknown, r: string) => (
                            <Button type='text' size='small' danger icon={<DeleteOutlined />}
                              onClick={() => setImeiList((prev) => prev.filter((i) => i !== r))} />
                          ),
                        },
                      ]}
                    />
                  ) : (
                    <Text type='secondary'>Chưa có IMEI nào. Nhập IMEI ở trên để thêm.</Text>
                  )}
                </>
              )}

              <Divider />
              <Button
                type='primary' block size='large' loading={importing}
                onClick={handleSubmit} icon={<ImportOutlined />}
                disabled={selectedProduct?.hasImei ? imeiList.length === 0 : false}
              >
                Xác nhận nhập kho {selectedProduct?.hasImei ? `(${imeiList.length} IMEI)` : ''}
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title='Sản phẩm cần nhập (sắp hết)' style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <Table
              rowKey='id' size='small'
              dataSource={allProducts.filter((p) => p.currentStock < p.minThreshold).slice(0, 8)}
              pagination={false}
              columns={[
                {
                  title: 'Sản phẩm', dataIndex: 'name', key: 'name', ellipsis: true,
                  render: (v: string, r: Product) => (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{v}</div>
                      <Text type='secondary' style={{ fontSize: 11 }}>{r.sku}</Text>
                    </div>
                  ),
                },
                {
                  title: 'Tồn / Ngưỡng', key: 'stock', width: 100,
                  render: (_, r: Product) => (
                    <Text style={{ color: r.currentStock === 0 ? '#ff4d4f' : '#faad14', fontWeight: 700 }}>
                      {r.currentStock} / {r.minThreshold}
                    </Text>
                  ),
                },
              ]}
              locale={{ emptyText: 'Tất cả sản phẩm đều đủ hàng' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick-add supplier modal */}
      <Modal title={<Space><ShopOutlined style={{ color: PRIMARY }} /><span>Thêm nhà cung cấp nhanh</span></Space>}
        open={quickAddOpen} onCancel={() => setQuickAddOpen(false)} width={480}
        footer={[
          <Button key='c' onClick={() => setQuickAddOpen(false)}>Huỷ</Button>,
          <Button key='s' type='primary' loading={creatingSupplier} onClick={handleQuickAddSupplier}>Thêm</Button>,
        ]}>
        <Form form={quickAddForm} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label='Tên nhà cung cấp' name='name' rules={[{ required: true, message: 'Nhập tên' }]}>
            <Input autoFocus placeholder='Công ty TNHH...' />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label='Người liên hệ' name='contactPerson'><Input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='Số điện thoại' name='phoneNumber'><Input /></Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default NhapKhoPage
