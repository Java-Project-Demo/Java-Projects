import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popover,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  AppstoreAddOutlined,
  BarcodeOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  ShopOutlined,
  SwapOutlined
} from '@ant-design/icons'
import { Trans, useTranslation } from 'react-i18next'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import BinPickerGrid from '@/components/shared/BinPickerGrid'
import {
  useCreateWarehouseMutation,
  useGetMapQuery,
  useMoveItemMutation,
  useSetupLayoutMutation
} from '@/features/warehouse/warehouseApi'
import type { WarehouseLocationResponse, WarehouseRequest, WarehouseResponse } from '@/types/api'

const { Text, Title } = Typography
const PRIMARY = '#E8603C'

interface SetupLayoutForm {
  zone: string
  row: string
  shelfCount: number
  binCount: number
}

interface MoveItemForm {
  imei: string
  targetLocId: number
}

const QuanLyKhoPage = () => {
  const { message } = App.useApp()
  const { t } = useTranslation(['warehouse', 'common'])
  const [createOpen, setCreateOpen] = useState(false)
  const [layoutTarget, setLayoutTarget] = useState<WarehouseResponse | null>(null)
  const [moveTarget, setMoveTarget] = useState<WarehouseResponse | null>(null)
  const [drawerWarehouse, setDrawerWarehouse] = useState<WarehouseResponse | null>(null)

  const [createForm] = Form.useForm<WarehouseRequest>()
  const [layoutForm] = Form.useForm<SetupLayoutForm>()
  const [moveForm] = Form.useForm<MoveItemForm>()

  const { data: warehouses = [], isLoading } = useGetMapQuery()
  const [createWarehouse, { isLoading: creating }] = useCreateWarehouseMutation()
  const [setupLayout, { isLoading: settingLayout }] = useSetupLayoutMutation()
  const [moveItem, { isLoading: moving }] = useMoveItemMutation()

  const totals = useMemo(() => {
    const totalBins = warehouses.reduce((s, w) => s + w.locations.length, 0)
    return {
      warehouses: warehouses.length,
      bins: totalBins
    }
  }, [warehouses])

  const openCreate = () => {
    createForm.resetFields()
    setCreateOpen(true)
  }

  const handleCreate = () => {
    createForm.validateFields().then(async (values) => {
      try {
        const created = await createWarehouse(values).unwrap()
        void message.success(t('create.success', { name: created.name }))
        setCreateOpen(false)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? t('common:error.system'))
      }
    })
  }

  const openLayout = (w: WarehouseResponse) => {
    layoutForm.resetFields()
    layoutForm.setFieldsValue({ shelfCount: 3, binCount: 5 })
    setLayoutTarget(w)
  }

  const handleSetupLayout = () => {
    layoutForm.validateFields().then(async (values) => {
      if (!layoutTarget) return
      try {
        await setupLayout({
          warehouseId: layoutTarget.id,
          zone: values.zone,
          row: values.row,
          shelfCount: values.shelfCount,
          binCount: values.binCount
        }).unwrap()
        void message.success(
          t('layout.success', {
            count: values.shelfCount * values.binCount,
            zone: values.zone,
            row: values.row
          })
        )
        setLayoutTarget(null)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? t('common:error.system'))
      }
    })
  }

  const openMove = (w: WarehouseResponse) => {
    moveForm.resetFields()
    setMoveTarget(w)
  }

  const handleMoveItem = () => {
    moveForm.validateFields().then(async (values) => {
      try {
        await moveItem({ imei: values.imei.trim(), targetLocId: values.targetLocId }).unwrap()
        void message.success(t('move.success'))
        setMoveTarget(null)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? t('common:error.system'))
      }
    })
  }

  const warehouseColumns: ColumnsType<WarehouseResponse> = [
    {
      title: t('col.warehouse'),
      dataIndex: 'name',
      key: 'name',
      render: (v: string, r) => (
        <Space>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `${PRIMARY}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShopOutlined style={{ color: PRIMARY }} />
          </div>
          <div>
            <Text strong>{v}</Text>
            {r.address && (
              <div>
                <Text type='secondary' style={{ fontSize: 12 }}>
                  {r.address}
                </Text>
              </div>
            )}
          </div>
        </Space>
      )
    },
    {
      title: t('col.bins'),
      key: 'bins',
      width: 120,
      render: (_, r) => <Tag color='blue'>{r.locations.length}</Tag>
    },
    {
      title: t('col.zones'),
      key: 'zones',
      width: 200,
      render: (_, r) => {
        const zones = Array.from(new Set(r.locations.map((l) => l.zoneName).filter(Boolean)))
        return zones.length > 0 ? (
          <Space size={4}>
            {zones.map((z) => (
              <Tag key={z}>{z}</Tag>
            ))}
          </Space>
        ) : (
          <Text type='secondary'>—</Text>
        )
      }
    },
    {
      title: t('col.actions'),
      key: 'action',
      width: 320,
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title={t('tooltip.map')}>
            <Button size='small' icon={<EnvironmentOutlined />} onClick={() => setDrawerWarehouse(r)}>
              {t('actions.map')}
            </Button>
          </Tooltip>
          <Button size='small' type='primary' ghost icon={<AppstoreAddOutlined />} onClick={() => openLayout(r)}>
            {t('actions.setupLayout')}
          </Button>
          <Button size='small' icon={<SwapOutlined />} onClick={() => openMove(r)}>
            {t('actions.moveImei')}
          </Button>
        </Space>
      )
    }
  ]

  const renderLocationGrid = (w: WarehouseResponse) => {
    if (w.locations.length === 0) {
      return <Empty description={t('empty.noBin')} />
    }
    const groups: Record<string, Record<string, WarehouseLocationResponse[]>> = {}
    w.locations.forEach((l) => {
      const z = l.zoneName ?? 'NO_ZONE'
      const r = l.rowNum ?? 'NO_ROW'
      groups[z] ??= {}
      groups[z][r] ??= []
      groups[z][r].push(l)
    })
    return (
      <>
        <Space size={4} style={{ marginBottom: 12, fontSize: 12 }}>
          <Tag color='default'>{t('drawer.legendEmpty')}</Tag>
          <Tag color='red'>{t('drawer.legendOccupied')}</Tag>
          <Text type='secondary'>{t('drawer.legendHint')}</Text>
        </Space>
        <Tabs
          items={Object.entries(groups).map(([zone, rows]) => ({
            key: zone,
            label: t('drawer.zoneTab', { zone }),
            children: (
              <Space direction='vertical' style={{ width: '100%' }} size={20}>
                {Object.entries(rows).map(([row, bins]) => (
                  <div key={row}>
                    <Text type='secondary' style={{ fontSize: 13 }}>
                      {t('drawer.rowLabel', { row })}
                    </Text>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                      {bins
                        .sort((a, b) => Number(a.shelfNum) - Number(b.shelfNum) || Number(a.binNum) - Number(b.binNum))
                        .map((b) => {
                          const count = b.items?.length ?? 0
                          const occupied = count > 0
                          const tag = (
                            <Tag
                              key={b.id}
                              style={{
                                fontFamily: 'monospace',
                                padding: '4px 10px',
                                borderRadius: 6,
                                margin: 0,
                                background: occupied ? '#fff1f0' : '#fafafa',
                                border: `1px solid ${occupied ? '#ffa39e' : '#d9d9d9'}`,
                                color: occupied ? '#cf1322' : undefined,
                                cursor: occupied ? 'help' : 'default'
                              }}
                            >
                              {`S${b.shelfNum}-B${b.binNum}`}
                              {occupied && (
                                <span
                                  style={{
                                    marginLeft: 6,
                                    padding: '0 6px',
                                    borderRadius: 8,
                                    background: '#cf1322',
                                    color: '#fff',
                                    fontSize: 10,
                                    fontWeight: 700
                                  }}
                                >
                                  {count}
                                </span>
                              )}
                            </Tag>
                          )
                          return occupied ? (
                            <Popover
                              key={b.id}
                              title={t('drawer.binPopoverTitle', { shelf: b.shelfNum, bin: b.binNum, count })}
                              content={
                                <div style={{ maxWidth: 280 }}>
                                  {b.items.map((it) => (
                                    <div key={it.id} style={{ marginBottom: 6 }}>
                                      <Text strong style={{ fontSize: 12 }}>
                                        {it.productName || `Product #${it.productId}`}
                                      </Text>
                                      <br />
                                      <Text type='secondary' style={{ fontSize: 11 }}>
                                        IMEI: <code>{it.imei}</code>
                                        {it.productSku && (
                                          <>
                                            {' '}
                                            · SKU: <code>{it.productSku}</code>
                                          </>
                                        )}
                                      </Text>
                                    </div>
                                  ))}
                                </div>
                              }
                            >
                              {tag}
                            </Popover>
                          ) : (
                            tag
                          )
                        })}
                    </div>
                  </div>
                ))}
              </Space>
            )
          }))}
        />
      </>
    )
  }

  return (
    <div>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        extra={
          <Button type='primary' icon={<PlusOutlined />} onClick={openCreate}>
            {t('createButton')}
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} md={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title={t('stats.totalWarehouses')}
              value={totals.warehouses}
              prefix={<ShopOutlined />}
              valueStyle={{ color: PRIMARY, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title={t('stats.totalBins')}
              value={totals.bins}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#1677ff', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <Table
          rowKey='id'
          loading={isLoading}
          columns={warehouseColumns}
          dataSource={warehouses}
          size='middle'
          bordered
          locale={{
            emptyText: (
              <EmptyState title={t('empty.title')} action={{ label: t('empty.action'), onClick: openCreate }} />
            )
          }}
        />
      </Card>

      <Modal
        title={t('create.title')}
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        width={480}
        footer={[
          <Button key='c' onClick={() => setCreateOpen(false)}>
            {t('common:button.cancel')}
          </Button>,
          <Button key='s' type='primary' loading={creating} onClick={handleCreate}>
            {t('create.submit')}
          </Button>
        ]}
      >
        <Form form={createForm} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item
            label={t('create.name')}
            name='name'
            rules={[{ required: true, message: t('create.nameRequired') }]}
          >
            <Input autoFocus placeholder={t('create.namePlaceholder')} />
          </Form.Item>
          <Form.Item label={t('create.address')} name='address'>
            <Input.TextArea rows={2} placeholder={t('create.addressPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={layoutTarget ? t('layout.title', { name: layoutTarget.name }) : ''}
        open={!!layoutTarget}
        onCancel={() => setLayoutTarget(null)}
        width={640}
        footer={[
          <Button key='c' onClick={() => setLayoutTarget(null)}>
            {t('common:button.cancel')}
          </Button>,
          <Button key='s' type='primary' loading={settingLayout} onClick={handleSetupLayout}>
            {t('layout.submit')}
          </Button>
        ]}
      >
        <Form form={layoutForm} layout='vertical' style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('layout.zone')}
                name='zone'
                rules={[{ required: true, message: t('layout.zoneRequired') }]}
              >
                <Input placeholder='A' autoFocus />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('layout.row')}
                name='row'
                rules={[{ required: true, message: t('layout.rowRequired') }]}
              >
                <Input placeholder='1' />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('layout.shelfCount')}
                name='shelfCount'
                rules={[{ required: true, message: t('layout.shelfCountRequired') }]}
              >
                <InputNumber
                  min={1}
                  max={20}
                  style={{ width: '100%' }}
                  parser={(s) => Number((s ?? '').replace(/[^0-9]/g, '')) || 1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('layout.binCount')}
                name='binCount'
                rules={[{ required: true, message: t('layout.binCountRequired') }]}
              >
                <InputNumber
                  min={1}
                  max={20}
                  style={{ width: '100%' }}
                  parser={(s) => Number((s ?? '').replace(/[^0-9]/g, '')) || 1}
                />
              </Form.Item>
            </Col>
          </Row>

          <LayoutPreview form={layoutForm} />

          <Text type='secondary' style={{ fontSize: 12 }}>
            <Trans i18nKey='layout.hint' ns='warehouse' components={[<Text strong key='0' />]} />
          </Text>
        </Form>
      </Modal>

      <Modal
        title={moveTarget ? t('move.title', { name: moveTarget.name }) : ''}
        open={!!moveTarget}
        onCancel={() => setMoveTarget(null)}
        width={760}
        footer={[
          <Button key='c' onClick={() => setMoveTarget(null)}>
            {t('common:button.cancel')}
          </Button>,
          <Button key='s' type='primary' loading={moving} onClick={handleMoveItem}>
            {t('move.submit')}
          </Button>
        ]}
      >
        <Form form={moveForm} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label={t('move.imei')} name='imei' rules={[{ required: true, message: t('move.imeiRequired') }]}>
            <Input prefix={<BarcodeOutlined />} placeholder={t('move.imeiPlaceholder')} autoFocus />
          </Form.Item>
          <Form.Item
            label={t('move.target')}
            name='targetLocId'
            rules={[{ required: true, message: t('move.targetRequired') }]}
          >
            <BinPickerGrid
              bins={moveTarget?.locations ?? []}
              disableConflictCheck
              value={moveForm.getFieldValue('targetLocId')}
              onChange={(id) => moveForm.setFieldsValue({ targetLocId: id })}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={drawerWarehouse ? t('drawer.title', { name: drawerWarehouse.name }) : ''}
        width={720}
        open={!!drawerWarehouse}
        onClose={() => setDrawerWarehouse(null)}
      >
        {drawerWarehouse && (
          <>
            <Title level={5} style={{ marginTop: 0 }}>
              {t('drawer.binCount', { count: drawerWarehouse.locations.length })}
            </Title>
            {drawerWarehouse.address && <Text type='secondary'>{drawerWarehouse.address}</Text>}
            <div style={{ marginTop: 16 }}>{renderLocationGrid(drawerWarehouse)}</div>
          </>
        )}
      </Drawer>
    </div>
  )
}

const LayoutPreview = ({ form }: { form: ReturnType<typeof Form.useForm<SetupLayoutForm>>[0] }) => {
  const { t } = useTranslation('warehouse')
  const zone = Form.useWatch('zone', form)
  const row = Form.useWatch('row', form)
  const shelfCount = Form.useWatch('shelfCount', form)
  const binCount = Form.useWatch('binCount', form)

  const valid = Number(shelfCount) > 0 && Number(binCount) > 0
  if (!valid) {
    return (
      <div style={{ padding: 12, background: '#fafafa', borderRadius: 8, marginBottom: 12 }}>
        <Text type='secondary' style={{ fontSize: 12 }}>
          {t('layout.previewHint')}
        </Text>
      </div>
    )
  }
  const total = Number(shelfCount) * Number(binCount)
  return (
    <div style={{ padding: 12, background: '#fafafa', borderRadius: 8, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text strong style={{ fontSize: 13 }}>
          <Trans
            i18nKey='layout.preview'
            ns='warehouse'
            values={{ zone: zone || '?', row: row || '?' }}
            components={[<Tag color='orange' key='0' />, <Tag color='orange' key='1' />]}
          />
        </Text>
        <Tag color={total > 60 ? 'red' : 'blue'}>{t('layout.previewBin', { count: total })}</Tag>
      </div>
      <div style={{ maxHeight: 220, overflow: 'auto' }}>
        {Array.from({ length: Number(shelfCount) }).map((_, si) => (
          <div key={si} style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
            <Text style={{ width: 36, fontSize: 11, color: '#888' }}>S{si + 1}</Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {Array.from({ length: Number(binCount) }).map((_, bi) => (
                <Tag
                  key={bi}
                  style={{
                    minWidth: 44,
                    textAlign: 'center',
                    margin: 0,
                    background: '#fff',
                    border: '1px dashed #d9d9d9',
                    fontFamily: 'monospace',
                    fontSize: 11
                  }}
                >
                  B{bi + 1}
                </Tag>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuanLyKhoPage
