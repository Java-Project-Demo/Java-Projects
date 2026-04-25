import { useState, useMemo } from 'react'
import {
  App, Avatar, Button, Card, Col, Descriptions, Drawer,
  Form, Input, InputNumber, Modal, Progress, Row,
  Select, Space, Statistic, Switch, Table, Tag, Tooltip, Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined, EyeOutlined, EditOutlined,
  ShoppingOutlined, WarningOutlined, ImportOutlined, ExportOutlined, InboxOutlined,
} from '@ant-design/icons'
import { useGetProductsQuery, useCreateProductMutation, useUpdateProductMutation } from '@/features/product/productApi'
import { useGetCategoriesQuery } from '@/features/category/categoryApi'
import type { Product, ProductStatus } from '@/types/api'

const { Title, Text } = Typography
const PRIMARY = '#E8603C'

const fmtCurrency = (v: number) =>
  (v ?? 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

const stockColor = (stock: number, threshold: number) => {
  if (stock === 0) return '#ff4d4f'
  if (stock < threshold) return '#faad14'
  return '#52c41a'
}

const stockLabel = (stock: number, threshold: number) => {
  if (stock === 0) return { label: 'Hết hàng', color: 'red' }
  if (stock < threshold) return { label: 'Sắp hết', color: 'orange' }
  return { label: 'Còn hàng', color: 'green' }
}

interface FormValues {
  name: string
  sku: string
  categoryId: number
  priceImport: number
  priceExport: number
  currentStock: number
  minThreshold: number
  warrantyPeriod: number
  hasImei: boolean
  status: ProductStatus
  specifications?: string
}

const KhoHangPage = () => {
  const { message } = App.useApp()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<number | undefined>()
  const [filterStatus, setFilterStatus] = useState<string | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerItem, setDrawerItem] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Product | null>(null)
  const [form] = Form.useForm<FormValues>()

  const { data: products = [], isLoading } = useGetProductsQuery()
  const { data: categories = [] } = useGetCategoriesQuery()
  const [createProduct, { isLoading: creating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation()

  const catMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  )

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const ms =
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase())
        const mc = !filterCat || p.categoryId === filterCat
        const mst = !filterStatus || p.status === filterStatus
        return ms && mc && mst
      }),
    [products, search, filterCat, filterStatus],
  )

  const stats = useMemo(() => ({
    total: products.length,
    lowStock: products.filter((p) => p.currentStock < p.minThreshold).length,
    outOfStock: products.filter((p) => p.currentStock === 0).length,
    active: products.filter((p) => p.status === 'ACTIVE').length,
  }), [products])

  const openAdd = () => {
    setEditItem(null)
    form.resetFields()
    form.setFieldsValue({ status: 'ACTIVE', hasImei: false, minThreshold: 10, warrantyPeriod: 12, currentStock: 0 })
    setModalOpen(true)
  }

  const openEdit = (r: Product) => {
    setEditItem(r)
    form.setFieldsValue({
      name: r.name, sku: r.sku, categoryId: r.categoryId,
      priceImport: r.priceImport, priceExport: r.priceExport,
      currentStock: r.currentStock, minThreshold: r.minThreshold,
      warrantyPeriod: r.warrantyPeriod ?? 12,
      hasImei: r.hasImei ?? false, status: r.status,
      specifications: r.specifications ?? '',
    })
    setModalOpen(true)
  }

  const handleSave = () => {
    form.validateFields().then(async (values) => {
      try {
        if (editItem) {
          await updateProduct({ id: editItem.id, data: values }).unwrap()
          void message.success('Cập nhật sản phẩm thành công!')
        } else {
          await createProduct(values).unwrap()
          void message.success('Thêm sản phẩm thành công!')
        }
        setModalOpen(false)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? 'Lỗi hệ thống')
      }
    })
  }

  const columns: ColumnsType<Product> = [
    {
      title: 'STT', key: 'stt', width: 55,
      render: (_, __, i) => <Text type='secondary'>{i + 1}</Text>,
    },
    {
      title: 'Sản phẩm', key: 'product', width: 280,
      render: (_, r) => (
        <Space>
          <Avatar shape='square' size={40} style={{ background: PRIMARY, fontWeight: 700, flexShrink: 0 }}>
            {r.name.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
            <Text type='secondary' style={{ fontSize: 12 }}>{r.sku}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Danh mục', dataIndex: 'categoryId', key: 'category', width: 140,
      render: (v: number) => <Tag>{catMap[v] ?? `#${v}`}</Tag>,
    },
    {
      title: 'Tồn kho', key: 'stock', width: 150,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 700, color: stockColor(r.currentStock, r.minThreshold), marginBottom: 4 }}>
            {r.currentStock} / ngưỡng {r.minThreshold}
          </div>
          <Progress
            percent={Math.min(100, Math.round((r.currentStock / Math.max(r.minThreshold * 3, 1)) * 100))}
            showInfo={false} size='small'
            strokeColor={stockColor(r.currentStock, r.minThreshold)}
          />
        </div>
      ),
    },
    {
      title: 'Giá nhập', dataIndex: 'priceImport', key: 'priceImport', width: 130,
      render: (v: number) => fmtCurrency(v),
    },
    {
      title: 'Giá xuất', dataIndex: 'priceExport', key: 'priceExport', width: 130,
      render: (v: number) => fmtCurrency(v),
    },
    {
      title: 'Trạng thái', key: 'status', width: 110,
      render: (_, r) => {
        const s = stockLabel(r.currentStock, r.minThreshold)
        return <Tag color={s.color}>{s.label}</Tag>
      },
    },
    {
      title: 'IMEI', dataIndex: 'hasImei', key: 'hasImei', width: 70,
      render: (v: boolean) => v ? <Tag color='blue'>Có</Tag> : <Tag>Không</Tag>,
    },
    {
      title: 'Hành động', key: 'action', width: 100,
      render: (_, record) => (
        <Space size={2}>
          <Tooltip title='Xem chi tiết'>
            <Button type='text' size='small' icon={<EyeOutlined style={{ color: PRIMARY }} />}
              onClick={() => { setDrawerItem(record); setDrawerOpen(true) }} />
          </Tooltip>
          <Tooltip title='Chỉnh sửa'>
            <Button type='text' size='small' icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={() => openEdit(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20 }}>Quản lý kho hàng</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Tổng sản phẩm', value: stats.total, icon: <ShoppingOutlined />, color: PRIMARY, sub: 'mặt hàng' },
          { title: 'Cần chú ý', value: stats.lowStock, icon: <WarningOutlined />, color: '#faad14', sub: 'sắp hết hàng' },
          { title: 'Hết hàng', value: stats.outOfStock, icon: <ImportOutlined />, color: '#ff4d4f', sub: 'mặt hàng' },
          { title: 'Đang hoạt động', value: stats.active, icon: <ExportOutlined />, color: '#52c41a', sub: 'sản phẩm' },
        ].map((card, idx) => (
          <Col xs={24} sm={12} xl={6} key={idx}>
            <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type='secondary' style={{ fontSize: 13 }}>{card.title}</Text>
                  <Statistic value={card.value}
                    suffix={<span style={{ fontSize: 13, color: '#888' }}>{card.sub}</span>}
                    valueStyle={{ fontSize: 28, fontWeight: 700, color: card.color }} />
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: `${card.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: card.color }}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input.Search placeholder='Tìm tên, mã SKU...' style={{ width: 250 }}
            value={search} onChange={(e) => setSearch(e.target.value)} allowClear />
          <Select placeholder='Danh mục' style={{ width: 160 }} allowClear
            value={filterCat} onChange={setFilterCat}
            options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          <Select placeholder='Tồn kho' style={{ width: 140 }} allowClear
            value={filterStatus} onChange={setFilterStatus}
            options={[
              { value: 'ACTIVE', label: 'Hoạt động' },
              { value: 'INACTIVE', label: 'Ngừng bán' },
            ]} />
          <div style={{ marginLeft: 'auto' }}>
            <Button type='primary' icon={<PlusOutlined />} onClick={openAdd}>Thêm sản phẩm</Button>
          </div>
        </div>

        <Table
          rowKey='id' loading={isLoading} columns={columns} dataSource={filtered}
          scroll={{ x: 1100 }} size='middle' bordered
          onRow={(r) => ({ style: r.currentStock === 0 ? { background: '#fff1f0' } : {} })}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t, rng) => `${rng[0]}-${rng[1]} / ${t}` }}
          locale={{ emptyText: (<div style={{ padding: 40, textAlign: 'center' }}><InboxOutlined style={{ fontSize: 48, color: '#ccc' }} /><br /><Text type='secondary'>Không có sản phẩm nào</Text></div>) }}
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title={drawerItem && (
          <Space>
            <Avatar shape='square' style={{ background: PRIMARY, fontWeight: 700 }}>{drawerItem.name.charAt(0)}</Avatar>
            <div>
              <div style={{ fontWeight: 700 }}>{drawerItem.name}</div>
              <Text type='secondary' style={{ fontSize: 12, fontWeight: 400 }}>{drawerItem.sku}</Text>
            </div>
          </Space>
        )}
        width={580} open={drawerOpen} onClose={() => setDrawerOpen(false)}
        extra={<Button icon={<EditOutlined />} onClick={() => { setDrawerOpen(false); drawerItem && openEdit(drawerItem) }}>Sửa</Button>}
      >
        {drawerItem && (
          <>
            <div style={{ background: `${PRIMARY}10`, borderRadius: 10, padding: 16, marginBottom: 20, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <Statistic title='Tồn kho' value={drawerItem.currentStock}
                valueStyle={{ color: stockColor(drawerItem.currentStock, drawerItem.minThreshold), fontWeight: 700 }} />
              <Statistic title='Giá nhập' value={drawerItem.priceImport} formatter={(v) => fmtCurrency(Number(v))} />
              <Statistic title='Giá xuất' value={drawerItem.priceExport} formatter={(v) => fmtCurrency(Number(v))} />
            </div>
            <Descriptions bordered column={2} size='small'>
              <Descriptions.Item label='Mã SKU'>{drawerItem.sku}</Descriptions.Item>
              <Descriptions.Item label='Danh mục'>{catMap[drawerItem.categoryId] ?? `#${drawerItem.categoryId}`}</Descriptions.Item>
              <Descriptions.Item label='Ngưỡng cảnh báo'>{drawerItem.minThreshold}</Descriptions.Item>
              <Descriptions.Item label='Thời hạn BH'>{drawerItem.warrantyPeriod ?? '—'} tháng</Descriptions.Item>
              <Descriptions.Item label='Theo IMEI'>{drawerItem.hasImei ? 'Có' : 'Không'}</Descriptions.Item>
              <Descriptions.Item label='Trạng thái'>
                {(() => { const s = stockLabel(drawerItem.currentStock, drawerItem.minThreshold); return <Tag color={s.color}>{s.label}</Tag> })()}
              </Descriptions.Item>
              <Descriptions.Item label='Lãi gộp / đơn vị' span={2}>
                <Text style={{ color: '#52c41a', fontWeight: 700 }}>
                  {fmtCurrency(drawerItem.priceExport - drawerItem.priceImport)}
                </Text>
                {drawerItem.priceImport > 0 && (
                  <Text type='secondary' style={{ marginLeft: 8 }}>
                    ({Math.round(((drawerItem.priceExport - drawerItem.priceImport) / drawerItem.priceImport) * 100)}%)
                  </Text>
                )}
              </Descriptions.Item>
              {drawerItem.specifications && (
                <Descriptions.Item label='Thông số' span={2}>{drawerItem.specifications}</Descriptions.Item>
              )}
            </Descriptions>
            {drawerItem.hasImei && drawerItem.items?.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <Text strong>Danh sách IMEI ({drawerItem.items.length})</Text>
                <Table
                  rowKey='id' size='small' style={{ marginTop: 8 }}
                  dataSource={drawerItem.items} pagination={false}
                  columns={[
                    { title: 'IMEI', dataIndex: 'imei', key: 'imei' },
                    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 100,
                      render: (v: string) => <Tag color={v === 'AVAILABLE' ? 'green' : v === 'SOLD' ? 'blue' : 'red'}>{v}</Tag> },
                  ]}
                />
              </div>
            )}
          </>
        )}
      </Drawer>

      {/* Add/Edit Modal */}
      <Modal
        title={editItem ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={modalOpen} onCancel={() => setModalOpen(false)} width={680}
        footer={[
          <Button key='cancel' onClick={() => setModalOpen(false)}>Huỷ</Button>,
          <Button key='save' type='primary' loading={creating || updating} onClick={handleSave}>
            {editItem ? 'Cập nhật' : 'Thêm mới'}
          </Button>,
        ]}
      >
        <Form form={form} layout='vertical' style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item label='Tên sản phẩm' name='name' rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                <Input placeholder='Nhập tên sản phẩm' />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label='Mã SKU' name='sku' rules={[{ required: true, message: 'Vui lòng nhập SKU' }]}>
                <Input disabled={!!editItem} placeholder='SP-XXXXX' />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label='Danh mục' name='categoryId' rules={[{ required: true, message: 'Chọn danh mục' }]}>
                <Select placeholder='Chọn danh mục' options={categories.map((c) => ({ value: c.id, label: c.name }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='Trạng thái' name='status' rules={[{ required: true }]}>
                <Select options={[{ value: 'ACTIVE', label: 'Hoạt động' }, { value: 'INACTIVE', label: 'Ngừng bán' }]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label='Giá nhập (₫)' name='priceImport' rules={[{ required: true, message: 'Nhập giá nhập' }]}>
                <InputNumber style={{ width: '100%' }} min={0} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} placeholder='0' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='Giá xuất (₫)' name='priceExport' rules={[{ required: true, message: 'Nhập giá xuất' }]}>
                <InputNumber style={{ width: '100%' }} min={0} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} placeholder='0' />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label='Tồn kho ban đầu' name='currentStock' rules={[{ required: true, message: 'Nhập số lượng' }]}>
                <InputNumber style={{ width: '100%' }} min={0} disabled={!!editItem} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label='Ngưỡng cảnh báo' name='minThreshold' rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label='Bảo hành (tháng)' name='warrantyPeriod' rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label='Theo dõi IMEI' name='hasImei' valuePropName='checked'>
                <Switch checkedChildren='Có' unCheckedChildren='Không' />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label='Thông số kỹ thuật' name='specifications'>
            <Input.TextArea rows={3} placeholder='Mô tả thông số (không bắt buộc)' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default KhoHangPage
