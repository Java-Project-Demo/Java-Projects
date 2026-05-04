import { useState, useMemo } from 'react'
import {
  App, Avatar, Button, Card, Col, Descriptions, Drawer,
  Form, Input, InputNumber, Modal, Progress, Row,
  Select, Space, Statistic, Switch, Table, Tabs, Tag, Tooltip, Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined, EyeOutlined, EditOutlined,
  ShoppingOutlined, WarningOutlined, ImportOutlined, ExportOutlined, DownloadOutlined,
} from '@ant-design/icons'
import { useGetProductsQuery, useCreateProductMutation, useUpdateProductMutation } from '@/features/product/productApi'
import { useGetCategoriesQuery } from '@/features/category/categoryApi'
import { useGetAuditLogsQuery } from '@/features/auditLog/auditLogApi'
import type { Product, ProductStatus } from '@/types/api'
import PageHeader from '@/components/shared/PageHeader'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay'
import EmptyState from '@/components/shared/EmptyState'

const { Text } = Typography
const PRIMARY = '#E8603C'

const fmtCurrency = (v: number) =>
  (v ?? 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

const stockColor = (s: number, t: number) => s === 0 ? '#ff4d4f' : s < t ? '#faad14' : '#52c41a'
const stockLabel = (s: number, t: number) => {
  if (s === 0) return { label: 'Hết hàng', color: 'red' }
  if (s < t) return { label: 'Sắp hết', color: 'orange' }
  return { label: 'Còn hàng', color: 'green' }
}

interface FormValues {
  name: string; sku: string; categoryId: number
  priceImport: number; priceExport: number; currentStock: number
  minThreshold: number; warrantyPeriod: number; hasImei: boolean
  status: ProductStatus; specifications?: string
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

  // Audit logs cho drawer detail (lọc theo entityId)
  const { data: allLogs = [] } = useGetAuditLogsQuery({ page: 0, size: 100 })
  const drawerLogs = useMemo(
    () => drawerItem ? allLogs.filter((l) => l.entityId === String(drawerItem.id)) : [],
    [allLogs, drawerItem],
  )

  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories])

  const filtered = useMemo(
    () => products.filter((p) => {
      const ms = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
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

  const handleToggleStatus = async (r: Product) => {
    const newStatus: ProductStatus = r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await updateProduct({ id: r.id, data: { sku: r.sku, name: r.name, categoryId: r.categoryId, priceImport: r.priceImport, priceExport: r.priceExport, hasImei: r.hasImei ?? false, currentStock: r.currentStock, warrantyPeriod: r.warrantyPeriod ?? 0, minThreshold: r.minThreshold, specifications: r.specifications ?? undefined, status: newStatus } }).unwrap()
      void message.success(`Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'ngừng bán'} sản phẩm`)
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      void message.error(e?.data?.message ?? 'Lỗi hệ thống')
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const header = ['ID', 'SKU', 'Tên sản phẩm', 'Danh mục', 'Giá nhập', 'Giá xuất', 'Tồn kho', 'Ngưỡng', 'Trạng thái']
    const rows = filtered.map((p) => [
      p.id, p.sku, p.name, catMap[p.categoryId] ?? '', p.priceImport, p.priceExport, p.currentStock, p.minThreshold, p.status,
    ])
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'vat-tu.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const columns: ColumnsType<Product> = [
    { title: 'STT', key: 'stt', width: 55, render: (_, __, i) => <Text type='secondary'>{i + 1}</Text> },
    {
      title: 'Sản phẩm', key: 'product', width: 260,
      render: (_, r) => (
        <Space>
          <Avatar shape='square' size={40} style={{ background: PRIMARY, fontWeight: 700, flexShrink: 0 }}>{r.name.charAt(0)}</Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
            <Text type='secondary' style={{ fontSize: 12 }}>{r.sku}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Danh mục', dataIndex: 'categoryId', key: 'category', width: 130,
      render: (v: number) => <Tag>{catMap[v] ?? `#${v}`}</Tag>,
    },
    {
      title: 'Tồn kho', key: 'stock', width: 150,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 700, color: stockColor(r.currentStock, r.minThreshold), marginBottom: 4 }}>
            {r.currentStock} / ngưỡng {r.minThreshold}
          </div>
          <Progress percent={Math.min(100, Math.round((r.currentStock / Math.max(r.minThreshold * 3, 1)) * 100))}
            showInfo={false} size='small' strokeColor={stockColor(r.currentStock, r.minThreshold)} />
        </div>
      ),
    },
    { title: 'Giá nhập', dataIndex: 'priceImport', key: 'pi', width: 120, render: (v: number) => <CurrencyDisplay value={v} size='small' /> },
    { title: 'Giá xuất', dataIndex: 'priceExport', key: 'pe', width: 120, render: (v: number) => <CurrencyDisplay value={v} size='small' /> },
    {
      title: 'Lãi gộp', key: 'margin', width: 110,
      render: (_, r) => (
        <Text style={{ color: '#52c41a', fontWeight: 600, fontSize: 12 }}>
          {fmtCurrency(r.priceExport - r.priceImport)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái', key: 'status', width: 110,
      render: (_, r) => { const s = stockLabel(r.currentStock, r.minThreshold); return <Tag color={s.color}>{s.label}</Tag> },
    },
    { title: 'IMEI', dataIndex: 'hasImei', key: 'hasImei', width: 65, render: (v: boolean) => v ? <Tag color='blue'>Có</Tag> : <Tag>Không</Tag> },
    {
      title: 'Hoạt động', key: 'active', width: 90,
      render: (_, r) => (
        <Tooltip title={r.status === 'ACTIVE' ? 'Ngừng bán' : 'Kích hoạt'}>
          <Switch size='small' checked={r.status === 'ACTIVE'} onChange={() => handleToggleStatus(r)} />
        </Tooltip>
      ),
    },
    {
      title: 'Hành động', key: 'action', width: 90,
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
      <PageHeader title='Quản lý kho hàng' />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Tổng sản phẩm', value: stats.total, icon: <ShoppingOutlined />, color: PRIMARY, sub: 'mặt hàng' },
          { title: 'Cần chú ý', value: stats.lowStock, icon: <WarningOutlined />, color: '#faad14', sub: 'sắp hết' },
          { title: 'Hết hàng', value: stats.outOfStock, icon: <ImportOutlined />, color: '#ff4d4f', sub: 'mặt hàng' },
          { title: 'Đang hoạt động', value: stats.active, icon: <ExportOutlined />, color: '#52c41a', sub: 'sản phẩm' },
        ].map((card, idx) => (
          <Col xs={24} sm={12} xl={6} key={idx}>
            <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type='secondary' style={{ fontSize: 13 }}>{card.title}</Text>
                  <Statistic value={card.value} suffix={<span style={{ fontSize: 13, color: '#888' }}>{card.sub}</span>}
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
          <Input.Search placeholder='Tìm tên, mã SKU...' style={{ width: 240 }}
            value={search} onChange={(e) => setSearch(e.target.value)} allowClear />
          <Select placeholder='Danh mục' style={{ width: 150 }} allowClear value={filterCat} onChange={setFilterCat}
            options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          <Select placeholder='Trạng thái' style={{ width: 140 }} allowClear value={filterStatus} onChange={setFilterStatus}
            options={[{ value: 'ACTIVE', label: 'Hoạt động' }, { value: 'INACTIVE', label: 'Ngừng bán' }]} />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>Xuất CSV</Button>
            <Button type='primary' icon={<PlusOutlined />} onClick={openAdd}>Thêm sản phẩm</Button>
          </div>
        </div>

        <Table rowKey='id' loading={isLoading} columns={columns} dataSource={filtered}
          scroll={{ x: 1300 }} size='middle' bordered
          onRow={(r) => ({ style: r.currentStock === 0 ? { background: '#fff1f0' } : {} })}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t, rng) => `${rng[0]}-${rng[1]} / ${t}` }}
          locale={{ emptyText: <EmptyState title='Không có sản phẩm nào' action={{ label: 'Thêm sản phẩm', onClick: openAdd }} /> }}
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
        width={600} open={drawerOpen} onClose={() => setDrawerOpen(false)}
        extra={<Button icon={<EditOutlined />} onClick={() => { setDrawerOpen(false); drawerItem && openEdit(drawerItem) }}>Sửa</Button>}
      >
        {drawerItem && (
          <Tabs defaultActiveKey='info' items={[
            {
              key: 'info', label: 'Thông tin',
              children: (
                <>
                  <div style={{ background: `${PRIMARY}10`, borderRadius: 10, padding: 16, marginBottom: 20, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <Statistic title='Tồn kho' value={drawerItem.currentStock} valueStyle={{ color: stockColor(drawerItem.currentStock, drawerItem.minThreshold), fontWeight: 700 }} />
                    <Statistic title='Giá nhập' value={drawerItem.priceImport} formatter={(v) => fmtCurrency(Number(v))} />
                    <Statistic title='Giá xuất' value={drawerItem.priceExport} formatter={(v) => fmtCurrency(Number(v))} />
                    <Statistic title='Lãi gộp' value={drawerItem.priceExport - drawerItem.priceImport} formatter={(v) => fmtCurrency(Number(v))} valueStyle={{ color: '#52c41a' }} />
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
                    {drawerItem.specifications && (
                      <Descriptions.Item label='Thông số' span={2}>{drawerItem.specifications}</Descriptions.Item>
                    )}
                  </Descriptions>
                  {drawerItem.hasImei && drawerItem.items?.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <Text strong>Danh sách IMEI ({drawerItem.items.length})</Text>
                      <Table rowKey='id' size='small' style={{ marginTop: 8 }} dataSource={drawerItem.items} pagination={false}
                        columns={[
                          { title: 'IMEI', dataIndex: 'imei', key: 'imei' },
                          { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 100,
                            render: (v: string) => <Tag color={v === 'AVAILABLE' ? 'green' : v === 'SOLD' ? 'blue' : 'red'}>{v}</Tag> },
                        ]}
                      />
                    </div>
                  )}
                </>
              ),
            },
            {
              key: 'history', label: 'Lịch sử nhập/xuất',
              children: (
                <Table rowKey='id' size='small' dataSource={drawerLogs} pagination={false}
                  columns={[
                    { title: 'Hành động', dataIndex: 'action', key: 'action', render: (v: string) => <Tag color={v?.includes('IMPORT') ? 'green' : 'blue'}>{v}</Tag> },
                    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 90, render: (v: string) => <Tag color={v === 'SUCCESS' ? 'green' : 'red'}>{v}</Tag> },
                    { title: 'Thời gian', dataIndex: 'createdAt', key: 'time', render: (v: string) => <Text style={{ fontSize: 11 }}>{v ? new Date(v).toLocaleString('vi-VN') : '—'}</Text> },
                  ]}
                  locale={{ emptyText: 'Chưa có lịch sử hoạt động' }}
                />
              ),
            },
          ]} />
        )}
      </Drawer>

      {/* Add/Edit Modal */}
      <Modal title={editItem ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={modalOpen} onCancel={() => setModalOpen(false)} width={700}
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
                <Input autoFocus placeholder='Nhập tên sản phẩm' />
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
              <Form.Item label='Giá nhập' name='priceImport' rules={[{ required: true, message: 'Nhập giá nhập' }]}>
                <InputNumber style={{ width: '100%' }} min={0} addonAfter='₫' formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} placeholder='0' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='Giá xuất' name='priceExport' rules={[{ required: true, message: 'Nhập giá xuất' }]}>
                <InputNumber style={{ width: '100%' }} min={0} addonAfter='₫' formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} placeholder='0' />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label='Tồn kho ban đầu' name='currentStock' rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} disabled={!!editItem} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<Tooltip title='Khi tồn kho xuống dưới mức này sẽ hiện cảnh báo'>Ngưỡng cảnh báo ⓘ</Tooltip>} name='minThreshold' rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label='Bảo hành (tháng)' name='warrantyPeriod' rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} addonAfter='tháng' />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<Tooltip title='Sản phẩm có số IMEI riêng (điện thoại, laptop, v.v.)'>Theo dõi IMEI ⓘ</Tooltip>} name='hasImei' valuePropName='checked'>
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
