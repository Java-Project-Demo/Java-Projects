import { useMemo, useState } from 'react'
import {
  App, Badge, Button, Card, Col, Drawer, Empty, Form, Input, InputNumber, Modal,
  Row, Select, Space, Statistic, Table, Tabs, Tag, Tooltip, Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined, AppstoreAddOutlined, SwapOutlined, ShopOutlined,
  EnvironmentOutlined, BarcodeOutlined,
} from '@ant-design/icons'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import {
  useGetMapQuery,
  useCreateWarehouseMutation,
  useSetupLayoutMutation,
  useMoveItemMutation,
  useGetAvailableBinsQuery,
} from '@/features/warehouse/warehouseApi'
import type {
  WarehouseLocationResponse,
  WarehouseRequest,
  WarehouseResponse,
} from '@/types/api'

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

const formatBin = (loc: WarehouseLocationResponse) => {
  const parts = [loc.zoneName, loc.rowNum, loc.shelfNum, loc.binNum].filter(Boolean)
  return parts.length > 0 ? parts.join('-') : `#${loc.id}`
}

const QuanLyKhoPage = () => {
  const { message } = App.useApp()
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

  const { data: availableBins = [] } = useGetAvailableBinsQuery(moveTarget?.id ?? 0, {
    skip: moveTarget == null,
  })

  const totals = useMemo(() => {
    const totalBins = warehouses.reduce((s, w) => s + w.locations.length, 0)
    return {
      warehouses: warehouses.length,
      bins: totalBins,
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
        void message.success(`Đã tạo kho "${created.name}"`)
        setCreateOpen(false)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? 'Lỗi hệ thống')
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
          binCount: values.binCount,
        }).unwrap()
        void message.success(
          `Đã tạo ${values.shelfCount * values.binCount} bin cho zone ${values.zone} - row ${values.row}`,
        )
        setLayoutTarget(null)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? 'Lỗi hệ thống')
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
        void message.success('Đã di chuyển IMEI sang vị trí mới')
        setMoveTarget(null)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? 'Lỗi hệ thống')
      }
    })
  }

  const warehouseColumns: ColumnsType<WarehouseResponse> = [
    {
      title: 'Kho', dataIndex: 'name', key: 'name',
      render: (v: string, r) => (
        <Space>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `${PRIMARY}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShopOutlined style={{ color: PRIMARY }} />
          </div>
          <div>
            <Text strong>{v}</Text>
            {r.address && <div><Text type='secondary' style={{ fontSize: 12 }}>{r.address}</Text></div>}
          </div>
        </Space>
      ),
    },
    {
      title: 'Số bin', key: 'bins', width: 120,
      render: (_, r) => <Tag color='blue'>{r.locations.length}</Tag>,
    },
    {
      title: 'Zones', key: 'zones', width: 200,
      render: (_, r) => {
        const zones = Array.from(new Set(r.locations.map((l) => l.zoneName).filter(Boolean)))
        return zones.length > 0
          ? <Space size={4}>{zones.map((z) => <Tag key={z}>{z}</Tag>)}</Space>
          : <Text type='secondary'>—</Text>
      },
    },
    {
      title: 'Hành động', key: 'action', width: 320,
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title='Xem chi tiết bin'>
            <Button size='small' icon={<EnvironmentOutlined />} onClick={() => setDrawerWarehouse(r)}>
              Bản đồ
            </Button>
          </Tooltip>
          <Button size='small' type='primary' ghost icon={<AppstoreAddOutlined />} onClick={() => openLayout(r)}>
            Setup layout
          </Button>
          <Button size='small' icon={<SwapOutlined />} onClick={() => openMove(r)}>
            Move IMEI
          </Button>
        </Space>
      ),
    },
  ]

  const renderLocationGrid = (w: WarehouseResponse) => {
    if (w.locations.length === 0) {
      return <Empty description={<>Chưa có bin. Bấm <Text strong>Setup layout</Text> để tạo.</>} />
    }
    // Group by zone → row → list of bins
    const groups: Record<string, Record<string, WarehouseLocationResponse[]>> = {}
    w.locations.forEach((l) => {
      const z = l.zoneName ?? 'NO_ZONE'
      const r = l.rowNum ?? 'NO_ROW'
      groups[z] ??= {}
      groups[z][r] ??= []
      groups[z][r].push(l)
    })
    return (
      <Tabs
        items={Object.entries(groups).map(([zone, rows]) => ({
          key: zone,
          label: `Zone ${zone}`,
          children: (
            <Space direction='vertical' style={{ width: '100%' }} size={20}>
              {Object.entries(rows).map(([row, bins]) => (
                <div key={row}>
                  <Text type='secondary' style={{ fontSize: 13 }}>Row {row}</Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                    {bins
                      .sort((a, b) => Number(a.shelfNum) - Number(b.shelfNum) || Number(a.binNum) - Number(b.binNum))
                      .map((b) => (
                        <Badge key={b.id} count={0} showZero={false}>
                          <Tag
                            style={{
                              fontFamily: 'monospace', padding: '4px 10px', borderRadius: 6,
                              background: '#fafafa', border: '1px solid #d9d9d9',
                            }}
                          >
                            {`S${b.shelfNum}-B${b.binNum}`}
                            <Text type='secondary' style={{ fontSize: 11, marginLeft: 6 }}>#{b.id}</Text>
                          </Tag>
                        </Badge>
                      ))}
                  </div>
                </div>
              ))}
            </Space>
          ),
        }))}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title='Quản lý kho vật lý'
        subtitle='Tạo kho, cấu hình layout zone/row/shelf/bin và di chuyển sản phẩm'
        extra={
          <Button type='primary' icon={<PlusOutlined />} onClick={openCreate}>
            Tạo kho mới
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} md={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title='Tổng kho' value={totals.warehouses} prefix={<ShopOutlined />} valueStyle={{ color: PRIMARY, fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title='Tổng bin' value={totals.bins} prefix={<EnvironmentOutlined />} valueStyle={{ color: '#1677ff', fontWeight: 700 }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <Table
          rowKey='id' loading={isLoading} columns={warehouseColumns} dataSource={warehouses}
          size='middle' bordered
          locale={{ emptyText: <EmptyState title='Chưa có kho nào' action={{ label: 'Tạo kho mới', onClick: openCreate }} /> }}
        />
      </Card>

      {/* Create warehouse modal */}
      <Modal
        title='Tạo kho mới' open={createOpen} onCancel={() => setCreateOpen(false)}
        width={480}
        footer={[
          <Button key='c' onClick={() => setCreateOpen(false)}>Huỷ</Button>,
          <Button key='s' type='primary' loading={creating} onClick={handleCreate}>Tạo kho</Button>,
        ]}
      >
        <Form form={createForm} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label='Tên kho' name='name' rules={[{ required: true, message: 'Nhập tên kho' }]}>
            <Input autoFocus placeholder='Kho trung tâm Hà Nội' />
          </Form.Item>
          <Form.Item label='Địa chỉ' name='address'>
            <Input.TextArea rows={2} placeholder='Số 1, ABC Street...' />
          </Form.Item>
        </Form>
      </Modal>

      {/* Setup layout modal */}
      <Modal
        title={layoutTarget ? `Cấu hình layout — ${layoutTarget.name}` : ''}
        open={!!layoutTarget} onCancel={() => setLayoutTarget(null)}
        width={520}
        footer={[
          <Button key='c' onClick={() => setLayoutTarget(null)}>Huỷ</Button>,
          <Button key='s' type='primary' loading={settingLayout} onClick={handleSetupLayout}>
            Tạo bin
          </Button>,
        ]}
      >
        <Form form={layoutForm} layout='vertical' style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label='Zone' name='zone' rules={[{ required: true, message: 'Nhập tên zone' }]}>
                <Input placeholder='A' autoFocus />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='Row' name='row' rules={[{ required: true, message: 'Nhập số row' }]}>
                <Input placeholder='1' />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label='Số kệ (shelves)' name='shelfCount' rules={[{ required: true, message: 'Nhập số kệ' }]}>
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='Số ô / kệ (bins)' name='binCount' rules={[{ required: true, message: 'Nhập số bin' }]}>
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Text type='secondary' style={{ fontSize: 12 }}>
            Hệ thống sẽ tạo <Text strong>shelves × bins</Text> bin trong zone-row chỉ định.
            VD: 3 × 5 = 15 bin (S1-B1, S1-B2, ..., S3-B5).
          </Text>
        </Form>
      </Modal>

      {/* Move IMEI modal */}
      <Modal
        title={moveTarget ? `Di chuyển IMEI — ${moveTarget.name}` : ''}
        open={!!moveTarget} onCancel={() => setMoveTarget(null)}
        width={520}
        footer={[
          <Button key='c' onClick={() => setMoveTarget(null)}>Huỷ</Button>,
          <Button key='s' type='primary' loading={moving} onClick={handleMoveItem}>Di chuyển</Button>,
        ]}
      >
        <Form form={moveForm} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label='IMEI' name='imei' rules={[{ required: true, message: 'Nhập IMEI cần move' }]}>
            <Input prefix={<BarcodeOutlined />} placeholder='Quét hoặc nhập IMEI' autoFocus />
          </Form.Item>
          <Form.Item label='Vị trí đích (chỉ hiển thị bin trống)' name='targetLocId' rules={[{ required: true, message: 'Chọn vị trí đích' }]}>
            <Select
              showSearch optionFilterProp='label'
              placeholder='Chọn bin trống'
              options={availableBins.map((b) => ({
                value: b.id, label: formatBin(b),
              }))}
              notFoundContent={<Empty description='Không còn bin trống' image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Map drawer */}
      <Drawer
        title={drawerWarehouse ? `Bản đồ — ${drawerWarehouse.name}` : ''}
        width={720} open={!!drawerWarehouse} onClose={() => setDrawerWarehouse(null)}
      >
        {drawerWarehouse && (
          <>
            <Title level={5} style={{ marginTop: 0 }}>
              {drawerWarehouse.locations.length} bin
            </Title>
            {drawerWarehouse.address && (
              <Text type='secondary'>{drawerWarehouse.address}</Text>
            )}
            <div style={{ marginTop: 16 }}>
              {renderLocationGrid(drawerWarehouse)}
            </div>
          </>
        )}
      </Drawer>
    </div>
  )
}

export default QuanLyKhoPage
