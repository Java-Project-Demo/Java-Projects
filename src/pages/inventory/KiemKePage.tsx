import { useState, useMemo } from 'react'
import {
  App, Alert, Button, Card, Col, Empty, Input, List,
  Result, Row, Select, Space, Statistic, Steps, Table, Tag, Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlayCircleOutlined, BarcodeOutlined, CheckCircleOutlined,
  ScanOutlined, PlusOutlined, DeleteOutlined,
} from '@ant-design/icons'
import PageHeader from '@/components/shared/PageHeader'
import {
  useStartSessionMutation,
  useRecordScanMutation,
  useCompleteSessionMutation,
} from '@/features/inventory/inventoryApi'
import { useGetMapQuery } from '@/features/warehouse/warehouseApi'
import type { WarehouseLocationResponse, WarehouseResponse } from '@/types/api'

const { Text, Title } = Typography
const PRIMARY = '#E8603C'

interface ScanRow {
  key: string
  imei: string
  locationId: number
  locationLabel: string
  status: 'OK' | 'ERROR'
  message?: string
}

const formatLocation = (loc: WarehouseLocationResponse, warehouseName?: string) => {
  const parts = [warehouseName, loc.zoneName, loc.rowNum, loc.shelfNum, loc.binNum].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : `#${loc.id}`
}

const KiemKePage = () => {
  const { message, modal } = App.useApp()
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>()
  const [imei, setImei] = useState('')
  const [locationId, setLocationId] = useState<number | undefined>()
  const [scans, setScans] = useState<ScanRow[]>([])

  const { data: warehouses = [], isLoading: loadingWarehouses } = useGetMapQuery()
  const [startSession, { isLoading: starting }] = useStartSessionMutation()
  const [recordScan, { isLoading: scanning }] = useRecordScanMutation()
  const [completeSession, { isLoading: completing }] = useCompleteSessionMutation()

  const selectedWarehouse: WarehouseResponse | undefined = useMemo(
    () => warehouses.find((w) => w.id === selectedWarehouseId),
    [warehouses, selectedWarehouseId],
  )

  const locationOptions = useMemo(
    () => (selectedWarehouse?.locations ?? []).map((l) => ({
      value: l.id,
      label: formatLocation(l),
    })),
    [selectedWarehouse],
  )

  const stats = useMemo(() => ({
    total: scans.length,
    ok: scans.filter((s) => s.status === 'OK').length,
    error: scans.filter((s) => s.status === 'ERROR').length,
  }), [scans])

  const handleStart = async () => {
    if (!selectedWarehouseId) {
      void message.error('Chọn kho cần kiểm kê')
      return
    }
    try {
      const id = await startSession().unwrap()
      setSessionId(id)
      setScans([])
      setStep(1)
      void message.success(`Đã mở phiên kiểm kê #${id}`)
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      void message.error(e?.data?.message ?? 'Không khởi tạo được phiên')
    }
  }

  const handleScan = async () => {
    if (sessionId == null) return
    const trimmed = imei.trim()
    if (!trimmed) {
      void message.warning('Nhập IMEI')
      return
    }
    if (locationId == null) {
      void message.warning('Chọn vị trí thực tế')
      return
    }
    if (scans.some((s) => s.imei === trimmed)) {
      void message.warning('IMEI này đã được scan trong phiên này')
      return
    }
    const loc = selectedWarehouse?.locations.find((l) => l.id === locationId)
    const locLabel = loc ? formatLocation(loc) : `#${locationId}`
    try {
      await recordScan({ sessionId, imei: trimmed, actualLocId: locationId }).unwrap()
      setScans((prev) => [
        { key: `${Date.now()}-${trimmed}`, imei: trimmed, locationId, locationLabel: locLabel, status: 'OK' },
        ...prev,
      ])
      setImei('')
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      const errMsg = e?.data?.message ?? 'Lỗi ghi nhận scan'
      setScans((prev) => [
        { key: `${Date.now()}-${trimmed}`, imei: trimmed, locationId, locationLabel: locLabel, status: 'ERROR', message: errMsg },
        ...prev,
      ])
      void message.error(errMsg)
    }
  }

  const handleComplete = () => {
    if (sessionId == null) return
    modal.confirm({
      title: 'Kết thúc phiên kiểm kê?',
      content: `Đã scan ${stats.ok} IMEI thành công. Sau khi kết thúc, BE sẽ đối chiếu và đánh dấu các IMEI MISSING (có trong DB nhưng chưa được scan).`,
      okText: 'Kết thúc & đối chiếu',
      cancelText: 'Tiếp tục scan',
      onOk: async () => {
        try {
          await completeSession(sessionId).unwrap()
          setStep(2)
          void message.success('Phiên kiểm kê đã được đối chiếu')
        } catch (err: unknown) {
          const e = err as { data?: { message?: string } }
          void message.error(e?.data?.message ?? 'Lỗi kết thúc phiên')
        }
      },
    })
  }

  const handleRestart = () => {
    setSessionId(null)
    setScans([])
    setImei('')
    setLocationId(undefined)
    setStep(0)
  }

  const removeScan = (key: string) =>
    setScans((prev) => prev.filter((s) => s.key !== key))

  const scanColumns: ColumnsType<ScanRow> = [
    { title: 'IMEI', dataIndex: 'imei', key: 'imei', width: 200, render: (v: string) => <Text code>{v}</Text> },
    { title: 'Vị trí thực tế', dataIndex: 'locationLabel', key: 'loc' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 110,
      render: (v: ScanRow['status'], r) => (
        <Tag color={v === 'OK' ? 'green' : 'red'}>
          {v === 'OK' ? 'Đã ghi nhận' : (r.message ?? 'Lỗi')}
        </Tag>
      ),
    },
    {
      title: '', key: 'action', width: 50,
      render: (_, r) => (
        <Button type='text' size='small' danger icon={<DeleteOutlined />} onClick={() => removeScan(r.key)} />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title='Kiểm kê kho'
        subtitle='Mở phiên — quét IMEI tại từng vị trí — đóng phiên để đối chiếu MATCH/MISMATCH/MISSING/EXTRA'
      />

      <Card style={{ borderRadius: 12, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <Steps
          current={step}
          items={[
            { title: 'Mở phiên', icon: <PlayCircleOutlined /> },
            { title: 'Quét IMEI', icon: <ScanOutlined /> },
            { title: 'Đối chiếu', icon: <CheckCircleOutlined /> },
          ]}
        />
      </Card>

      {step === 0 && (
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <Title level={5}>Chọn kho cần kiểm kê</Title>
          {warehouses.length === 0 && !loadingWarehouses && (
            <Alert
              type='warning'
              showIcon
              message='Chưa có kho nào trong hệ thống'
              description={<>Vào trang <Text strong>Quản lý kho</Text> để tạo kho và bin trước khi kiểm kê.</>}
              style={{ marginBottom: 16 }}
            />
          )}
          <Select
            style={{ width: '100%', maxWidth: 480 }}
            size='large'
            placeholder='Chọn kho...'
            loading={loadingWarehouses}
            value={selectedWarehouseId}
            onChange={setSelectedWarehouseId}
            options={warehouses.map((w) => ({
              value: w.id,
              label: `${w.name}${w.address ? ' — ' + w.address : ''} (${w.locations.length} bin)`,
            }))}
          />
          <div style={{ marginTop: 24 }}>
            <Button
              type='primary' size='large' icon={<PlayCircleOutlined />}
              loading={starting} disabled={!selectedWarehouseId}
              onClick={handleStart}
            >
              Bắt đầu phiên kiểm kê
            </Button>
          </div>
        </Card>
      )}

      {step === 1 && sessionId != null && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            {[
              { title: 'Phiên', value: `#${sessionId}`, color: PRIMARY },
              { title: 'Đã quét', value: stats.total, color: '#1677ff' },
              { title: 'Thành công', value: stats.ok, color: '#52c41a' },
              { title: 'Lỗi', value: stats.error, color: '#ff4d4f' },
            ].map((s, i) => (
              <Col xs={12} xl={6} key={i}>
                <Card style={{ borderRadius: 12 }}>
                  <Statistic title={s.title} value={s.value} valueStyle={{ color: s.color, fontWeight: 700 }} />
                </Card>
              </Col>
            ))}
          </Row>

          <Card
            style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 16 }}
            title={<Space><ScanOutlined style={{ color: PRIMARY }} /><span>Quét IMEI</span></Space>}
          >
            <Row gutter={12}>
              <Col xs={24} md={9}>
                <Input
                  size='large'
                  prefix={<BarcodeOutlined />}
                  placeholder='Quét hoặc nhập IMEI'
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  onPressEnter={handleScan}
                  autoFocus
                />
              </Col>
              <Col xs={24} md={11}>
                <Select
                  size='large' style={{ width: '100%' }}
                  showSearch optionFilterProp='label'
                  placeholder='Chọn bin / vị trí thực tế'
                  value={locationId}
                  onChange={setLocationId}
                  options={locationOptions}
                />
              </Col>
              <Col xs={24} md={4}>
                <Button
                  type='primary' size='large' block
                  icon={<PlusOutlined />} loading={scanning}
                  onClick={handleScan}
                >
                  Ghi nhận
                </Button>
              </Col>
            </Row>
          </Card>

          <Card
            style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
            title={`Lịch sử scan trong phiên (${scans.length})`}
            extra={
              <Button
                type='primary' icon={<CheckCircleOutlined />}
                loading={completing} onClick={handleComplete}
                disabled={scans.length === 0}
              >
                Kết thúc & đối chiếu
              </Button>
            }
          >
            <Table
              rowKey='key' size='small' bordered
              columns={scanColumns} dataSource={scans}
              pagination={{ pageSize: 8 }}
              locale={{ emptyText: <Empty description='Chưa có scan nào' /> }}
            />
          </Card>
        </>
      )}

      {step === 2 && (
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <Result
            status='success'
            title='Phiên kiểm kê đã hoàn tất'
            subTitle={
              <>
                Phiên <Text strong>#{sessionId}</Text> đã ghi nhận <Text strong>{stats.ok}</Text> IMEI và đã đối chiếu.
                Truy cập <Text strong>Audit log</Text> hoặc DB để xem chi tiết kết quả MATCH / MISMATCH / MISSING / EXTRA.
              </>
            }
            extra={
              <Space>
                <Button type='primary' onClick={handleRestart}>Bắt đầu phiên mới</Button>
              </Space>
            }
          />
          {stats.total > 0 && (
            <List
              size='small' bordered
              header={<Text strong>Tóm tắt phiên</Text>}
              dataSource={[
                `Tổng scan: ${stats.total}`,
                `Thành công: ${stats.ok}`,
                `Lỗi tại UI: ${stats.error}`,
              ]}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          )}
        </Card>
      )}
    </div>
  )
}

export default KiemKePage
