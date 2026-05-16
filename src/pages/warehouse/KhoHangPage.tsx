import { useState, useMemo } from 'react'
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload
} from 'antd'
import type { UploadFile } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  ShoppingOutlined,
  WarningOutlined,
  ImportOutlined,
  ExportOutlined,
  DownloadOutlined,
  DeleteOutlined,
  UndoOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useSetProductDeletedMutation
} from '@/features/product/productApi'
import { useGetCategoriesQuery } from '@/features/category/categoryApi'
import { useGetAuditLogsQuery } from '@/features/auditLog/auditLogApi'
import { useUploadImageMutation } from '@/features/system/systemApi'
import type { Product, ProductStatus } from '@/types/api'
import PageHeader from '@/components/shared/PageHeader'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay'
import EmptyState from '@/components/shared/EmptyState'
import { useLocaleFormat } from '@/utils/useLocaleFormat'
import { useCan } from '@/utils/permissions'

const { Text } = Typography
const PRIMARY = '#E8603C'

const stockColor = (s: number, t: number) => (s === 0 ? '#ff4d4f' : s < t ? '#faad14' : '#52c41a')

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
  imageUrl: string
}

const KhoHangPage = () => {
  const { message, modal } = App.useApp()
  const { t } = useTranslation(['product', 'common'])
  const { currency: fmtCurrency, dateTime } = useLocaleFormat()
  const canCreate = useCan('PRODUCT_CREATE')
  const canUpdate = useCan('PRODUCT_UPDATE')
  const canDelete = useCan('PRODUCT_DELETE')
  const canManage = canCreate || canUpdate || canDelete
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<number | undefined>()
  const [filterStatus, setFilterStatus] = useState<string | undefined>()
  const [showDeleted, setShowDeleted] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerItem, setDrawerItem] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Product | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [form] = Form.useForm<FormValues>()

  const { data: products = [], isLoading } = useGetProductsQuery()
  const { data: categories = [] } = useGetCategoriesQuery()
  const [createProduct, { isLoading: creating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation()
  const [setProductDeleted] = useSetProductDeletedMutation()
  const [uploadImage, { isLoading: uploading }] = useUploadImageMutation()
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const stockLabel = (s: number, threshold: number) => {
    if (s === 0) return { label: t('common:status.product.outOfStock'), color: 'red' }
    if (s < threshold) return { label: t('common:status.product.lowStock'), color: 'orange' }
    return { label: t('common:status.product.inStock'), color: 'green' }
  }

  const { data: allLogs = [] } = useGetAuditLogsQuery({ page: 0, size: 100 })
  const drawerLogs = useMemo(
    () => (drawerItem ? allLogs.filter((l) => l.entityId === String(drawerItem.id)) : []),
    [allLogs, drawerItem]
  )

  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories])

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (!showDeleted && p.isDeleted) return false
        const ms =
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase())
        const mc = !filterCat || p.categoryId === filterCat
        const mst = !filterStatus || p.status === filterStatus
        return ms && mc && mst
      }),
    [products, search, filterCat, filterStatus, showDeleted]
  )

  const stats = useMemo(
    () => ({
      total: products.length,
      lowStock: products.filter((p) => p.currentStock < p.minThreshold).length,
      outOfStock: products.filter((p) => p.currentStock === 0).length,
      active: products.filter((p) => p.status === 'ACTIVE').length
    }),
    [products]
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getBase64 = (file: any): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })

  const openAdd = () => {
    setEditItem(null)
    form.resetFields()
    form.setFieldsValue({ status: 'ACTIVE', hasImei: false, minThreshold: 10, warrantyPeriod: 12, currentStock: 0, imageUrl: '' })
    setFileList([])
    setModalOpen(true)
  }

  const openEdit = (r: Product) => {
    setEditItem(r)
    form.setFieldsValue({
      name: r.name,
      sku: r.sku,
      categoryId: r.categoryId,
      priceImport: r.priceImport,
      priceExport: r.priceExport,
      imageUrl: r.imageUrl,
      currentStock: r.currentStock,
      minThreshold: r.minThreshold,
      warrantyPeriod: r.warrantyPeriod ?? 12,
      hasImei: r.hasImei ?? false,
      status: r.status,
      specifications: r.specifications ?? ''
    })
    setFileList(r.imageUrl ? [{ uid: '-1', name: 'image.png', status: 'done', url: r.imageUrl }] : [])
    setModalOpen(true)
  }

  const handleSave = () => {
    form.validateFields().then(async (values) => {
      try {
        if (editItem) {
          await updateProduct({ id: editItem.id, data: values }).unwrap()
          void message.success(t('modal.successEdit'))
        } else {
          await createProduct(values).unwrap()
          void message.success(t('modal.successAdd'))
        }
        setModalOpen(false)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? t('common:error.system'))
      }
    })
  }

  const handleSoftDelete = (r: Product) => {
    modal.confirm({
      title: r.isDeleted ? t('softDelete.titleRestore') : t('softDelete.titleHide'),
      content: r.isDeleted ? t('softDelete.contentRestore', { name: r.name }) : t('softDelete.contentHide', { name: r.name }),
      okText: r.isDeleted ? t('common:button.restore') : t('common:button.hide'),
      okButtonProps: { danger: !r.isDeleted },
      cancelText: t('common:button.cancel'),
      onOk: async () => {
        try {
          await setProductDeleted({ id: r.id, isDeleted: !r.isDeleted, current: r }).unwrap()
          void message.success(r.isDeleted ? t('softDelete.successRestore') : t('softDelete.successHide'))
        } catch (err: unknown) {
          const e = err as { data?: { message?: string } }
          void message.error(e?.data?.message ?? t('common:error.system'))
        }
      }
    })
  }

  const handleToggleStatus = async (r: Product) => {
    const newStatus: ProductStatus = r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await updateProduct({
        id: r.id,
        data: {
          sku: r.sku,
          name: r.name,
          categoryId: r.categoryId,
          priceImport: r.priceImport,
          priceExport: r.priceExport,
          imageUrl: r.imageUrl,
          hasImei: r.hasImei ?? false,
          currentStock: r.currentStock,
          warrantyPeriod: r.warrantyPeriod ?? 0,
          minThreshold: r.minThreshold,
          specifications: r.specifications ?? undefined,
          status: newStatus
        }
      }).unwrap()
      void message.success(t('toggleStatus.success', { action: newStatus === 'ACTIVE' ? t('toggleStatus.activate') : t('toggleStatus.deactivate') }))
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      void message.error(e?.data?.message ?? t('common:error.system'))
    }
  }

  const handleExportCSV = () => {
    const header = [
      t('csv.headerId'), t('csv.headerSku'), t('csv.headerName'), t('csv.headerCategory'),
      t('csv.headerPriceImport'), t('csv.headerPriceExport'), t('csv.headerStock'),
      t('csv.headerThreshold'), t('csv.headerStatus')
    ]
    const rows = filtered.map((p) => [
      p.id,
      p.sku,
      p.name,
      catMap[p.categoryId] ?? '',
      p.priceImport,
      p.priceExport,
      p.currentStock,
      p.minThreshold,
      p.status
    ])
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const columns: ColumnsType<Product> = [
    { title: t('col.no'), key: 'stt', width: 55, render: (_, __, i) => <Text type='secondary'>{i + 1}</Text> },
    {
      title: t('col.product'),
      key: 'product',
      width: 200,
      render: (_, r) => (
        <Space>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
            <Text type='secondary' style={{ fontSize: 12 }}>{r.sku}</Text>
          </div>
        </Space>
      )
    },
    {
      title: t('col.category'),
      dataIndex: 'categoryId',
      key: 'category',
      width: 130,
      render: (v: number) => <Tag>{catMap[v] ?? `#${v}`}</Tag>
    },
    {
      title: t('col.image'),
      dataIndex: 'imageUrl',
      key: 'image',
      width: 120,
      render: (_, r) => <Image width={120} height={120} alt={r.name} src={r.imageUrl} />
    },
    {
      title: t('col.stock'),
      key: 'stock',
      width: 150,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 700, color: stockColor(r.currentStock, r.minThreshold), marginBottom: 4 }}>
            {t('col.stockThreshold', { stock: r.currentStock, threshold: r.minThreshold })}
          </div>
          <Progress
            percent={Math.min(100, Math.round((r.currentStock / Math.max(r.minThreshold * 3, 1)) * 100))}
            showInfo={false}
            size='small'
            strokeColor={stockColor(r.currentStock, r.minThreshold)}
          />
        </div>
      )
    },
    {
      title: t('col.priceImport'),
      dataIndex: 'priceImport',
      key: 'pi',
      width: 120,
      render: (v: number) => <CurrencyDisplay value={v} size='small' />
    },
    {
      title: t('col.priceExport'),
      dataIndex: 'priceExport',
      key: 'pe',
      width: 120,
      render: (v: number) => <CurrencyDisplay value={v} size='small' />
    },
    {
      title: t('col.margin'),
      key: 'margin',
      width: 110,
      render: (_, r) => (
        <Text style={{ color: '#52c41a', fontWeight: 600, fontSize: 12 }}>
          {fmtCurrency(r.priceExport - r.priceImport)}
        </Text>
      )
    },
    {
      title: t('col.status'),
      key: 'status',
      width: 110,
      render: (_, r) => {
        const s = stockLabel(r.currentStock, r.minThreshold)
        return <Tag color={s.color}>{s.label}</Tag>
      }
    },
    {
      title: t('col.imei'),
      dataIndex: 'hasImei',
      key: 'hasImei',
      width: 65,
      render: (v: boolean) => (v ? <Tag color='blue'>{t('common:common.yes')}</Tag> : <Tag>{t('common:common.no')}</Tag>)
    },
    ...(canUpdate ? [{
      title: t('col.active'),
      key: 'active',
      width: 90,
      render: (_: unknown, r: Product) => (
        <Tooltip title={r.status === 'ACTIVE' ? t('tooltip.deactivate') : t('tooltip.activate')}>
          <Switch size='small' checked={r.status === 'ACTIVE'} onChange={() => handleToggleStatus(r)} />
        </Tooltip>
      )
    }] : []),
    {
      title: t('col.actions'),
      key: 'action',
      width: 130,
      render: (_, record) => (
        <Space size={2}>
          <Tooltip title={t('common:button.viewDetail')}>
            <Button
              type='text'
              size='small'
              icon={<EyeOutlined style={{ color: PRIMARY }} />}
              onClick={() => {
                setDrawerItem(record)
                setDrawerOpen(true)
              }}
            />
          </Tooltip>
          {canUpdate && (
            <Tooltip title={t('tooltip.edit')}>
              <Button
                type='text'
                size='small'
                icon={<EditOutlined style={{ color: '#1677ff' }} />}
                onClick={() => openEdit(record)}
                disabled={record.isDeleted}
              />
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title={record.isDeleted ? t('tooltip.restore') : t('tooltip.hide')}>
              <Button
                type='text'
                size='small'
                icon={record.isDeleted ? <UndoOutlined style={{ color: '#52c41a' }} /> : <DeleteOutlined style={{ color: '#ff4d4f' }} />}
                onClick={() => handleSoftDelete(record)}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <PageHeader title={t('page.title')} />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: t('stats.totalProducts'), value: stats.total, icon: <ShoppingOutlined />, color: PRIMARY, sub: t('stats.totalProductsSub') },
          { title: t('stats.lowStock'), value: stats.lowStock, icon: <WarningOutlined />, color: '#faad14', sub: t('stats.lowStockSub') },
          { title: t('stats.outOfStock'), value: stats.outOfStock, icon: <ImportOutlined />, color: '#ff4d4f', sub: t('stats.outOfStockSub') },
          { title: t('stats.active'), value: stats.active, icon: <ExportOutlined />, color: '#52c41a', sub: t('stats.activeSub') }
        ].map((card, idx) => (
          <Col xs={24} sm={12} xl={6} key={idx}>
            <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type='secondary' style={{ fontSize: 13 }}>{card.title}</Text>
                  <Statistic
                    value={card.value}
                    suffix={<span style={{ fontSize: 13, color: '#888' }}>{card.sub}</span>}
                    valueStyle={{ fontSize: 28, fontWeight: 700, color: card.color }}
                  />
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
          <Input.Search
            placeholder={t('filter.search')}
            style={{ width: 240 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <Select
            placeholder={t('filter.category')}
            style={{ width: 150 }}
            allowClear
            value={filterCat}
            onChange={setFilterCat}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Select
            placeholder={t('filter.status')}
            style={{ width: 140 }}
            allowClear
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'ACTIVE', label: t('common:status.product.active') },
              { value: 'INACTIVE', label: t('common:status.product.inactive') }
            ]}
          />
          {canManage && (
            <Button
              type={showDeleted ? 'primary' : 'default'}
              ghost={showDeleted}
              icon={<DeleteOutlined />}
              onClick={() => setShowDeleted((v) => !v)}
            >
              {showDeleted ? t('common:button.viewingHidden') : t('common:button.showHidden')}
            </Button>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>{t('common:button.exportCsv')}</Button>
            {canCreate && (
              <Button type='primary' icon={<PlusOutlined />} onClick={openAdd}>{t('empty.action')}</Button>
            )}
          </div>
        </div>

        <Table
          rowKey='id'
          loading={isLoading}
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1300 }}
          size='middle'
          bordered
          onRow={(r) => ({ style: r.currentStock === 0 ? { background: '#fff1f0' } : {} })}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total, rng) => t('table.totalSummary', { start: rng[0], end: rng[1], total }) }}
          locale={{ emptyText: <EmptyState title={t('empty.title')} action={canCreate ? { label: t('empty.action'), onClick: openAdd } : undefined} /> }}
        />
      </Card>

      <Drawer
        title={
          drawerItem && (
            <Space>
              <Avatar shape='square' style={{ background: PRIMARY, fontWeight: 700 }}>
                {drawerItem.name.charAt(0)}
              </Avatar>
              <div>
                <div style={{ fontWeight: 700 }}>{drawerItem.name}</div>
                <Text type='secondary' style={{ fontSize: 12, fontWeight: 400 }}>{drawerItem.sku}</Text>
              </div>
            </Space>
          )
        }
        width={600}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          canUpdate ? (
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setDrawerOpen(false)
                if (drawerItem) openEdit(drawerItem)
              }}
            >
              {t('drawer.edit')}
            </Button>
          ) : undefined
        }
      >
        {drawerItem && (
          <Tabs
            defaultActiveKey='info'
            items={[
              {
                key: 'info',
                label: t('drawer.tabInfo'),
                children: (
                  <>
                    <div style={{ background: `${PRIMARY}10`, borderRadius: 10, padding: 16, marginBottom: 20, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                      <Statistic title={t('drawer.stock')} value={drawerItem.currentStock}
                        valueStyle={{ color: stockColor(drawerItem.currentStock, drawerItem.minThreshold), fontWeight: 700 }} />
                      <Statistic title={t('drawer.priceImport')} value={drawerItem.priceImport}
                        formatter={(v) => fmtCurrency(Number(v))} />
                      <Statistic title={t('drawer.priceExport')} value={drawerItem.priceExport}
                        formatter={(v) => fmtCurrency(Number(v))} />
                      <Statistic title={t('drawer.margin')} value={drawerItem.priceExport - drawerItem.priceImport}
                        formatter={(v) => fmtCurrency(Number(v))} valueStyle={{ color: '#52c41a' }} />
                    </div>
                    <Descriptions bordered column={2} size='small'>
                      <Descriptions.Item label={t('drawer.fieldSku')}>{drawerItem.sku}</Descriptions.Item>
                      <Descriptions.Item label={t('drawer.fieldCategory')}>
                        {catMap[drawerItem.categoryId] ?? `#${drawerItem.categoryId}`}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('drawer.fieldThreshold')}>{drawerItem.minThreshold}</Descriptions.Item>
                      <Descriptions.Item label={t('drawer.fieldWarranty')}>
                        {drawerItem.warrantyPeriod ?? '—'} {t('common:common.months')}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('drawer.fieldHasImei')}>
                        {drawerItem.hasImei ? t('common:common.yes') : t('common:common.no')}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('drawer.fieldStatus')}>
                        {(() => {
                          const s = stockLabel(drawerItem.currentStock, drawerItem.minThreshold)
                          return <Tag color={s.color}>{s.label}</Tag>
                        })()}
                      </Descriptions.Item>
                      {drawerItem.specifications && (
                        <Descriptions.Item label={t('drawer.fieldSpecs')} span={2}>
                          {drawerItem.specifications}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                    {drawerItem.hasImei && drawerItem.items?.length > 0 && (
                      <div style={{ marginTop: 20 }}>
                        <Text strong>{t('drawer.imeiList', { count: drawerItem.items.length })}</Text>
                        <Table
                          rowKey='id'
                          size='small'
                          style={{ marginTop: 8 }}
                          dataSource={drawerItem.items}
                          pagination={false}
                          columns={[
                            { title: t('drawer.imeiColImei'), dataIndex: 'imei', key: 'imei' },
                            {
                              title: t('drawer.imeiColStatus'),
                              dataIndex: 'status',
                              key: 'status',
                              width: 100,
                              render: (v: string) => (
                                <Tag color={v === 'AVAILABLE' ? 'green' : v === 'SOLD' ? 'blue' : 'red'}>
                                  {t(`common:status.item.${v}`, { defaultValue: v })}
                                </Tag>
                              )
                            }
                          ]}
                        />
                      </div>
                    )}
                  </>
                )
              },
              {
                key: 'history',
                label: t('drawer.tabHistory'),
                children: (
                  <Table
                    rowKey='id'
                    size='small'
                    dataSource={drawerLogs}
                    pagination={false}
                    columns={[
                      {
                        title: t('drawer.historyColAction'),
                        dataIndex: 'action',
                        key: 'action',
                        render: (v: string) => <Tag color={v?.includes('IMPORT') ? 'green' : 'blue'}>{v}</Tag>
                      },
                      {
                        title: t('drawer.historyColStatus'),
                        dataIndex: 'status',
                        key: 'status',
                        width: 90,
                        render: (v: string) => <Tag color={v === 'SUCCESS' ? 'green' : 'red'}>{t(`common:status.log.${v}`, { defaultValue: v })}</Tag>
                      },
                      {
                        title: t('drawer.historyColTime'),
                        dataIndex: 'createdAt',
                        key: 'time',
                        render: (v: string) => <Text style={{ fontSize: 11 }}>{dateTime(v)}</Text>
                      }
                    ]}
                    locale={{ emptyText: t('drawer.historyEmpty') }}
                  />
                )
              }
            ]}
          />
        )}
      </Drawer>

      <Modal
        title={editItem ? t('modal.titleEdit') : t('modal.titleAdd')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={700}
        footer={[
          <Button key='cancel' onClick={() => setModalOpen(false)}>{t('common:button.cancel')}</Button>,
          <Button key='save' type='primary' loading={creating || updating} onClick={handleSave}>
            {editItem ? t('common:button.update') : t('common:button.create')}
          </Button>
        ]}
      >
        <Form form={form} layout='vertical' style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item label={t('modal.name')} name='name' rules={[{ required: true, message: t('modal.nameRequired') }]}>
                <Input autoFocus placeholder={t('modal.namePlaceholder')} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t('modal.sku')} name='sku' rules={[{ required: true, message: t('modal.skuRequired') }]}>
                <Input disabled={!!editItem} placeholder={t('modal.skuPlaceholder')} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={t('modal.category')} name='categoryId' rules={[{ required: true, message: t('modal.categoryRequired') }]}>
                <Select placeholder={t('modal.categoryPlaceholder')} options={categories.map((c) => ({ value: c.id, label: c.name }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t('modal.status')} name='status' rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'ACTIVE', label: t('common:status.product.active') },
                    { value: 'INACTIVE', label: t('common:status.product.inactive') }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={t('modal.priceImport')} name='priceImport' rules={[{ required: true, message: t('modal.priceImportRequired') }]}>
                <InputNumber<number>
                  style={{ width: '100%' }}
                  min={0}
                  addonAfter='₫'
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(v) => (Number((v ?? '').replace(/\./g, '')) || 0) as number}
                  placeholder='0'
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t('modal.priceExport')} name='priceExport' rules={[{ required: true, message: t('modal.priceExportRequired') }]}>
                <InputNumber<number>
                  style={{ width: '100%' }}
                  min={0}
                  addonAfter='₫'
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(v) => (Number((v ?? '').replace(/\./g, '')) || 0) as number}
                  placeholder='0'
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label={t('modal.currentStock')} name='currentStock' rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} disabled={!!editItem} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={<Tooltip title={t('modal.minThresholdTooltip')}>{t('modal.minThreshold')}</Tooltip>}
                name='minThreshold'
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t('modal.warrantyPeriod')} name='warrantyPeriod' rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} addonAfter={t('modal.warrantyPeriodSuffix')} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<Tooltip title={t('modal.hasImeiTooltip')}>{t('modal.hasImei')}</Tooltip>}
                name='hasImei'
                valuePropName='checked'
              >
                <Switch checkedChildren={t('common:common.yes')} unCheckedChildren={t('common:common.no')} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label={t('modal.specifications')} name='specifications'>
            <Input.TextArea rows={3} placeholder={t('modal.specificationsPlaceholder')} />
          </Form.Item>

          <Form.Item name='imageUrl' noStyle>
            <Input type='hidden' />
          </Form.Item>

          <Form.Item label={t('modal.image')}>
            <Upload
              listType='picture-card'
              fileList={fileList}
              maxCount={1}
              onPreview={async (file) => {
                if (!file.url && !file.preview) {
                  file.preview = await getBase64(file.originFileObj)
                }
                setPreviewImage(file.url || (file.preview as string))
                setPreviewOpen(true)
              }}
              onRemove={() => {
                setFileList([])
                form.setFieldValue('imageUrl', '')
              }}
              onChange={({ fileList: newFileList }) => {
                setFileList(newFileList)
              }}
              customRequest={async ({ file, onSuccess, onError }) => {
                const formData = new FormData()
                formData.append('image', file as File)
                try {
                  const url = await uploadImage(formData).unwrap()
                  form.setFieldValue('imageUrl', url)
                  setFileList([{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    uid: (file as any).uid || '-1',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    name: (file as any).name || 'image.png',
                    status: 'done',
                    url
                  }])
                  onSuccess?.('ok')
                  void message.success(t('modal.uploadSuccess'))
                } catch (err) {
                  onError?.(err as Error)
                  void message.error(t('modal.uploadFail'))
                }
              }}
            >
              {fileList.length < 1 && (
                <div>
                  {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div style={{ marginTop: 8 }}>{uploading ? t('modal.uploading') : t('modal.uploadLabel')}</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal open={previewOpen} title={t('modal.previewTitle')} footer={null} onCancel={() => setPreviewOpen(false)}>
        <Image preview={false} alt='preview' style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  )
}

export default KhoHangPage
