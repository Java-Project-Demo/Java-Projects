import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography
} from 'antd'
import { PlusOutlined, ImportOutlined, DeleteOutlined, ShopOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useGetProductsQuery } from '@/features/product/productApi'
import { useImportImeiMutation } from '@/features/stock/stockApi'
import { useGetSuppliersQuery, useCreateSupplierMutation } from '@/features/supplier/supplierApi'
import { useGetMapQuery, useGetAvailableBinsQuery } from '@/features/warehouse/warehouseApi'
import type { Product, SupplierRequest } from '@/types/api'
import PageHeader from '@/components/shared/PageHeader'
import BinPickerGrid from '@/components/shared/BinPickerGrid'

const { Text } = Typography
const PRIMARY = '#E8603C'

interface FormValues {
  productId: number
  costPrice: number
  supplierId: number
  warehouseId: number
  locationId: number
  imeiList: string[]
}

const NhapKhoPage = () => {
  const { message } = App.useApp()
  const { t } = useTranslation(['stock', 'common'])
  const [form] = Form.useForm<FormValues>()
  const [quickAddForm] = Form.useForm<SupplierRequest>()
  const [imeiInput, setImeiInput] = useState('')
  const [imeiList, setImeiList] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>()
  const [result, setResult] = useState<{ name: string; count: number; imeis: string[] } | null>(null)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const { data: products = [], isLoading: loadingProducts } = useGetProductsQuery()
  const { data: suppliers = [], isLoading: loadingSuppliers } = useGetSuppliersQuery()
  const { data: warehouses = [], isLoading: loadingWarehouses } = useGetMapQuery()
  const { data: availableBins = [], isLoading: loadingBins } = useGetAvailableBinsQuery(selectedWarehouseId ?? 0, {
    skip: selectedWarehouseId == null
  })
  const [importImei, { isLoading: importing }] = useImportImeiMutation()
  const [createSupplier, { isLoading: creatingSupplier }] = useCreateSupplierMutation()

  const allProducts = useMemo(() => products.filter((p) => p.hasImei && !p.isDeleted), [products])
  const supplierOptions = useMemo(
    () => [
      ...suppliers.filter((s) => !s.isDeleted).map((s) => ({ value: s.id, label: s.name })),
      { value: -1, label: t('import.supplierAddNew') }
    ],
    [suppliers, t]
  )

  const warehouseOptions = useMemo(
    () => warehouses.map((w) => ({ value: w.id, label: `${w.name}${w.address ? ' — ' + w.address : ''}` })),
    [warehouses]
  )

  const selectedWarehouse = useMemo(
    () => warehouses.find((w) => w.id === selectedWarehouseId) ?? null,
    [warehouses, selectedWarehouseId]
  )
  const availableBinIds = useMemo(() => new Set(availableBins.map((b) => b.id)), [availableBins])

  const handleAddImei = () => {
    const trimmed = imeiInput.trim()
    if (!trimmed) return
    if (imeiList.includes(trimmed)) {
      void message.warning(t('import.imeiDuplicate'))
      return
    }
    setImeiList((prev) => [...prev, trimmed])
    setImeiInput('')
  }

  const handleProductChange = (id: number) => {
    const p = allProducts.find((p) => p.id === id) ?? null
    setSelectedProduct(p)
    if (!p?.hasImei) setImeiList([])
  }

  const handleSupplierChange = (v: number) => {
    if (v === -1) {
      form.setFieldValue('supplierId', undefined)
      quickAddForm.resetFields()
      setQuickAddOpen(true)
    }
  }

  const handleWarehouseChange = (v: number) => {
    setSelectedWarehouseId(v)
    form.setFieldValue('locationId', undefined)
  }

  const handleQuickAddSupplier = () => {
    quickAddForm.validateFields().then(async (values) => {
      try {
        const created = await createSupplier(values).unwrap()
        void message.success(t('import.quickAddSuccess'))
        form.setFieldValue('supplierId', created.id)
        setQuickAddOpen(false)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? t('common:error.system'))
      }
    })
  }

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      if (Number(values.costPrice) <= 0) {
        void message.error(t('import.costPricePositiveAlt'))
        return
      }
      const product = allProducts.find((p) => p.id === values.productId)
      if (product?.hasImei && imeiList.length === 0) {
        void message.error(t('import.imeiRequired'))
        return
      }
      try {
        await importImei({
          productId: values.productId,
          locationId: values.locationId,
          supplierId: values.supplierId,
          costPrice: values.costPrice,
          imeiList: product?.hasImei ? imeiList : []
        }).unwrap()
        setResult({
          name: product?.name ?? '',
          count: product?.hasImei ? imeiList.length : 1,
          imeis: product?.hasImei ? [...imeiList] : []
        })
        void message.success(t('import.success'))
        form.resetFields()
        setImeiList([])
        setSelectedProduct(null)
        setSelectedWarehouseId(undefined)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? t('common:error.system'))
      }
    })
  }

  return (
    <div>
      <PageHeader title={t('import.title')} breadcrumb={[{ title: t('import.breadcrumb'), href: '/nhap-kho' }]} />

      {result && (
        <Card style={{ borderRadius: 12, background: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div>
              <Text strong style={{ color: '#52c41a', fontSize: 15 }}>
                {t('import.successHeader', { name: result.name, count: result.count })}
              </Text>
              {result.imeis.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Text type='secondary' style={{ fontSize: 12 }}>
                    {t('import.imeiListLabel')}
                  </Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                    {result.imeis.map((imei) => (
                      <Tag key={imei} color='green' icon={<ImportOutlined />}>
                        {imei}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button type='text' size='small' onClick={() => setResult(null)}>
              {t('common:button.close')}
            </Button>
          </div>
        </Card>
      )}

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
          <Card title={t('import.formTitle')} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <Form form={form} layout='vertical'>
              <Form.Item label={t('import.productLabel')} name='productId' rules={[{ required: true, message: t('import.productRequired') }]}>
                <Select
                  showSearch
                  loading={loadingProducts}
                  placeholder={t('import.productPlaceholder')}
                  filterOption={(input, opt) =>
                    ((opt?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={handleProductChange}
                  options={allProducts.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
                />
              </Form.Item>

              {selectedProduct && (
                <Card size='small' style={{ marginBottom: 16, background: '#fafafa' }}>
                  <Descriptions size='small' column={2}>
                    <Descriptions.Item label={t('import.infoSku')}>{selectedProduct.sku}</Descriptions.Item>
                    <Descriptions.Item label={t('import.infoCurrentStock')}>{selectedProduct.currentStock}</Descriptions.Item>
                    <Descriptions.Item label={t('import.infoThreshold')}>{selectedProduct.minThreshold}</Descriptions.Item>
                    <Descriptions.Item label={t('import.infoHasImei')}>
                      <Tag color={selectedProduct.hasImei ? 'blue' : 'default'}>
                        {selectedProduct.hasImei ? t('common:common.yes') : t('common:common.no')}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={t('import.costPrice')}
                    name='costPrice'
                    rules={[
                      { required: true, message: t('import.costPriceRequired') },
                      { type: 'number', min: 1, message: t('import.costPricePositive') }
                    ]}
                  >
                    <InputNumber<number>
                      style={{ width: '100%' }}
                      min={0}
                      max={9999999999}
                      addonAfter='₫'
                      formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                      parser={(s) => (Number((s ?? '').replace(/[^0-9]/g, '')) || 0) as number}
                      placeholder='0'
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={t('import.supplierLabel')}
                    name='supplierId'
                    rules={[{ required: true, message: t('import.supplierRequired') }]}
                  >
                    <Select
                      showSearch
                      loading={loadingSuppliers}
                      placeholder={t('import.supplierPlaceholder')}
                      filterOption={(input, opt) =>
                        String(opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      onChange={handleSupplierChange}
                      options={supplierOptions}
                      optionRender={(opt) =>
                        opt.value === -1 ? (
                          <span style={{ color: PRIMARY }}>
                            <ShopOutlined /> {opt.label}
                          </span>
                        ) : (
                          <span>{opt.label as string}</span>
                        )
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label={t('import.warehouseLabel')} name='warehouseId' rules={[{ required: true, message: t('import.warehouseRequired') }]}>
                <Select
                  showSearch
                  loading={loadingWarehouses}
                  placeholder={t('import.warehousePlaceholder')}
                  filterOption={(input, opt) =>
                    String(opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={handleWarehouseChange}
                  options={warehouseOptions}
                />
              </Form.Item>

              <Form.Item
                label={
                  <Space>
                    <EnvironmentOutlined />
                    <span>{t('import.locationLabel')}</span>
                    {loadingBins && <Text type='secondary' style={{ fontSize: 11 }}>{t('import.locationLoading')}</Text>}
                  </Space>
                }
                name='locationId'
                rules={[{ required: true, message: t('import.locationRequired') }]}
              >
                <BinPickerGrid
                  warehouse={selectedWarehouse}
                  availableIds={availableBinIds}
                  compact
                />
              </Form.Item>

              {selectedProduct?.hasImei && (
                <>
                  <Divider orientation='left' style={{ fontSize: 13 }}>
                    {t('import.imeiHeader')}
                  </Divider>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <Input
                      placeholder={t('import.imeiInputPlaceholder')}
                      value={imeiInput}
                      onChange={(e) => setImeiInput(e.target.value)}
                      onPressEnter={handleAddImei}
                      style={{ flex: 1 }}
                    />
                    <Button icon={<PlusOutlined />} onClick={handleAddImei}>
                      {t('import.imeiAddButton')}
                    </Button>
                  </div>
                  {imeiList.length > 0 ? (
                    <Table
                      rowKey={(r) => r}
                      size='small'
                      dataSource={imeiList}
                      pagination={false}
                      columns={[
                        {
                          title: t('import.imeiColumn', { count: imeiList.length }),
                          key: 'imei',
                          render: (_: unknown, r: string) => <Text code>{r}</Text>
                        },
                        {
                          title: '',
                          key: 'del',
                          width: 50,
                          render: (_: unknown, r: string) => (
                            <Button
                              type='text'
                              size='small'
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => setImeiList((prev) => prev.filter((i) => i !== r))}
                            />
                          )
                        }
                      ]}
                    />
                  ) : (
                    <Text type='secondary'>{t('import.imeiEmpty')}</Text>
                  )}
                </>
              )}

              <Divider />
              <Button
                type='primary'
                block
                size='large'
                loading={importing}
                onClick={handleSubmit}
                icon={<ImportOutlined />}
                disabled={selectedProduct?.hasImei ? imeiList.length === 0 : false}
              >
                {t('import.submit')} {selectedProduct?.hasImei ? t('import.submitSuffix', { count: imeiList.length }) : ''}
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={t('import.needRestockTitle')}
            style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
          >
            <Table
              rowKey='id'
              size='small'
              dataSource={allProducts.filter((p) => p.currentStock < p.minThreshold).slice(0, 8)}
              pagination={false}
              columns={[
                {
                  title: t('import.needRestockColProduct'),
                  dataIndex: 'name',
                  key: 'name',
                  ellipsis: true,
                  render: (v: string, r: Product) => (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{v}</div>
                      <Text type='secondary' style={{ fontSize: 11 }}>{r.sku}</Text>
                    </div>
                  )
                },
                {
                  title: t('import.needRestockColStock'),
                  key: 'stock',
                  width: 100,
                  render: (_, r: Product) => (
                    <Text style={{ color: r.currentStock === 0 ? '#ff4d4f' : '#faad14', fontWeight: 700 }}>
                      {r.currentStock} / {r.minThreshold}
                    </Text>
                  )
                }
              ]}
              locale={{ emptyText: t('import.needRestockEmpty') }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <Space>
            <ShopOutlined style={{ color: PRIMARY }} />
            <span>{t('import.quickAddTitle')}</span>
          </Space>
        }
        open={quickAddOpen}
        onCancel={() => setQuickAddOpen(false)}
        width={480}
        footer={[
          <Button key='c' onClick={() => setQuickAddOpen(false)}>{t('common:button.cancel')}</Button>,
          <Button key='s' type='primary' loading={creatingSupplier} onClick={handleQuickAddSupplier}>
            {t('import.quickAddSubmit')}
          </Button>
        ]}
      >
        <Form form={quickAddForm} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label={t('import.quickAddNameLabel')} name='name' rules={[{ required: true, message: t('import.quickAddNameRequired') }]}>
            <Input autoFocus placeholder={t('import.quickAddNamePlaceholder')} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={t('import.quickAddContact')} name='contactPerson'>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t('import.quickAddPhone')} name='phoneNumber'>
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default NhapKhoPage
