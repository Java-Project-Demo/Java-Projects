import { useState, useMemo } from 'react'
import {
  App, Alert, Button, Card, Col, Descriptions, Empty, Input,
  Row, Select, Space, Statistic, Steps, Table, Tabs, Tag, Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlayCircleOutlined, BarcodeOutlined, CheckCircleOutlined,
  ScanOutlined, PlusOutlined, DeleteOutlined, EnvironmentOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import PageHeader from '@/components/shared/PageHeader'
import {
  useStartSessionMutation,
  useRecordScanMutation,
  useCompleteSessionMutation,
} from '@/features/inventory/inventoryApi'
import { useGetMapQuery } from '@/features/warehouse/warehouseApi'
import type {
  WarehouseLocationResponse, WarehouseResponse,
  InventorySessionResponse, ScanResultResponse, SessionSummaryResponse,
  DetailStatus,
} from '@/types/api'

const { Text, Title } = Typography
const PRIMARY = '#E8603C'

interface ScanRow {
  key: string
  imei: string
  status: DetailStatus | 'ERROR'
  expectedLabel: string | null
  actualLabel: string | null
  message?: string
}

const STATUS_TAG: Record<DetailStatus | 'ERROR', { color: string; label: string }> = {
  MATCH:    { color: 'green',  label: 'Đúng vị trí' },
  MISMATCH: { color: 'orange', label: 'Sai vị trí' },
  EXTRA:    { color: 'red',    label: 'Hàng lạ' },
  MISSING:  { color: 'volcano', label: 'Thiếu' },
  ERROR:    { color: 'red',    label: 'Lỗi' },
}

const formatLocation = (loc: WarehouseLocationResponse) => {
  const parts = [loc.zoneName, loc.rowNum, loc.shelfNum, loc.binNum].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : `#${loc.id}`
}

const KiemKePage = () => {
  const { message, modal } = App.useApp()
  const { t } = useTranslation(['inventory', 'common'])
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [session, setSession] = useState<InventorySessionResponse | null>(null)
  const [summary, setSummary] = useState<SessionSummaryResponse | null>(null)
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

  const activeWarehouse: WarehouseResponse | undefined = useMemo(
    () => warehouses.find((w) => w.id === session?.warehouseId),
    [warehouses, session?.warehouseId],
  )

  const locationOptions = useMemo(
    () => (activeWarehouse?.locations ?? []).map((l) => ({
      value: l.id,
      label: formatLocation(l),
    })),
    [activeWarehouse],
  )

  const stats = useMemo(() => ({
    total: scans.length,
    match: scans.filter((s) => s.status === 'MATCH').length,
    mismatch: scans.filter((s) => s.status === 'MISMATCH').length,
    extra: scans.filter((s) => s.status === 'EXTRA').length,
    error: scans.filter((s) => s.status === 'ERROR').length,
  }), [scans])

  const handleStart = async () => {
    if (!selectedWarehouseId) {
      void message.error(t('open.warehouseRequired'))
      return
    }
    try {
      const sess = await startSession({ warehouseId: selectedWarehouseId }).unwrap()
      setSession(sess)
      setScans([])
      setStep(1)
      void message.success(t('open.sessionStarted', { id: sess.id }))
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      void message.error(e?.data?.message ?? t('open.sessionFail'))
    }
  }

  const handleScan = async () => {
    if (session == null) return
    const trimmed = imei.trim()
    if (!trimmed) { void message.warning(t('scan.imeiRequired')); return }
    if (locationId == null) { void message.warning(t('scan.locationRequired')); return }
    if (scans.some((s) => s.imei === trimmed)) { void message.warning(t('scan.duplicate')); return }

    try {
      const result: ScanResultResponse = await recordScan({
        sessionId: session.id, imei: trimmed, actualLocId: locationId,
      }).unwrap()
      setScans((prev) => [
        {
          key: `${Date.now()}-${trimmed}`,
          imei: result.imei,
          status: result.status,
          expectedLabel: result.expectedLocLabel,
          actualLabel: result.actualLocLabel,
        },
        ...prev,
      ])
      setImei('')
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      const errMsg = e?.data?.message ?? t('scan.scanFail')
      const actLoc = activeWarehouse?.locations.find((l) => l.id === locationId)
      setScans((prev) => [
        {
          key: `${Date.now()}-${trimmed}`,
          imei: trimmed,
          status: 'ERROR',
          expectedLabel: null,
          actualLabel: actLoc ? formatLocation(actLoc) : `#${locationId}`,
          message: errMsg,
        },
        ...prev,
      ])
      void message.error(errMsg)
    }
  }

  const handleComplete = () => {
    if (session == null) return
    modal.confirm({
      title: t('complete.title'),
      content: t('complete.content', { count: stats.match }),
      okText: t('complete.okText'),
      cancelText: t('complete.cancelText'),
      onOk: async () => {
        try {
          const sum = await completeSession(session.id).unwrap()
          setSummary(sum)
          setStep(2)
          void message.success(t('complete.success'))
        } catch (err: unknown) {
          const e = err as { data?: { message?: string } }
          void message.error(e?.data?.message ?? t('complete.fail'))
        }
      },
    })
  }

  const handleRestart = () => {
    setSession(null)
    setSummary(null)
    setScans([])
    setImei('')
    setLocationId(undefined)
    setStep(0)
  }

  const removeScan = (key: string) => setScans((prev) => prev.filter((s) => s.key !== key))

  const scanColumns: ColumnsType<ScanRow> = [
    { title: 'IMEI', dataIndex: 'imei', key: 'imei', width: 180, render: (v) => <Text code>{v}</Text> },
    { title: 'Vị trí scan', dataIndex: 'actualLabel', key: 'actual', render: (v: string | null) => v ?? '—' },
    {
      title: 'Vị trí trong DB', dataIndex: 'expectedLabel', key: 'expected',
      render: (v: string | null, r) => {
        if (r.status === 'MATCH') return <Text type='success'>khớp</Text>
        if (r.status === 'EXTRA') return <Text type='secondary'>không có trong DB</Text>
        if (r.status === 'ERROR') return <Text type='danger'>—</Text>
        return v ?? '—'
      },
    },
    {
      title: 'Kết quả', dataIndex: 'status', key: 'status', width: 130,
      render: (v: ScanRow['status'], r) => {
        const cfg = STATUS_TAG[v]
        return <Tag color={cfg.color}>{r.message ?? cfg.label}</Tag>
      },
    },
    {
      title: '', key: 'action', width: 50,
      render: (_, r) => (
        <Button type='text' size='small' danger icon={<DeleteOutlined />} onClick={() => removeScan(r.key)} />
      ),
    },
  ]

  const summaryColumns: ColumnsType<ScanResultResponse> = [
    { title: 'IMEI', dataIndex: 'imei', key: 'imei', width: 180, render: (v) => <Text code>{v}</Text> },
    { title: 'Vị trí trong DB', dataIndex: 'expectedLocLabel', key: 'expected', render: (v: string | null) => v ?? <Text type='secondary'>—</Text> },
    { title: 'Vị trí scan', dataIndex: 'actualLocLabel', key: 'actual', render: (v: string | null) => v ?? <Text type='secondary'>—</Text> },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
      render: (v: DetailStatus) => <Tag color={STATUS_TAG[v].color}>{STATUS_TAG[v].label}</Tag>,
    },
  ]

  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <Card style={{ borderRadius: 12, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <Steps
          current={step}
          items={[
            { title: t('steps.open'), icon: <PlayCircleOutlined /> },
            { title: t('steps.scan'), icon: <ScanOutlined /> },
            { title: t('steps.reconcile'), icon: <CheckCircleOutlined /> },
          ]}
        />
      </Card>

      {step === 0 && (
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <Title level={5}>{t('open.title')}</Title>
          {warehouses.length === 0 && !loadingWarehouses && (
            <Alert
              type='warning' showIcon
              message={t('open.noWarehouseTitle')}
              description={t('open.noWarehouseDesc')}
              style={{ marginBottom: 16 }}
            />
          )}
          <Select
            style={{ width: '100%', maxWidth: 480 }}
            size='large'
            placeholder={t('open.placeholder')}
            loading={loadingWarehouses}
            value={selectedWarehouseId}
            onChange={setSelectedWarehouseId}
            options={warehouses.map((w) => ({
              value: w.id,
              label: t('open.option', {
                name: w.name,
                address: w.address ? ` — ${w.address}` : '',
                count: w.locations.length,
              }),
            }))}
          />
          {selectedWarehouse && (
            <Alert
              type='info' showIcon style={{ marginTop: 16, maxWidth: 600 }}
              message={<><EnvironmentOutlined /> {selectedWarehouse.name}</>}
              description={
                <>
                  {selectedWarehouse.address ?? '—'} · {selectedWarehouse.locations.length} bin
                </>
              }
            />
          )}
          <div style={{ marginTop: 24 }}>
            <Button
              type='primary' size='large' icon={<PlayCircleOutlined />}
              loading={starting} disabled={!selectedWarehouseId}
              onClick={handleStart}
            >
              {t('open.submit')}
            </Button>
          </div>
        </Card>
      )}

      {step === 1 && session != null && (
        <>
          <Card style={{ borderRadius: 12, marginBottom: 16, background: '#fff7e6', border: '1px solid #ffd591' }}>
            <Descriptions size='small' column={{ xs: 1, sm: 2, md: 4 }}>
              <Descriptions.Item label='Phiên'><Text strong>#{session.id}</Text></Descriptions.Item>
              <Descriptions.Item label='Kho'>
                <Space>
                  <EnvironmentOutlined style={{ color: PRIMARY }} />
                  <Text strong>{session.warehouseName ?? '—'}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label='Người mở'>{session.createdByUsername ?? `#${session.createdBy}`}</Descriptions.Item>
              <Descriptions.Item label='Bắt đầu'>{new Date(session.startDate).toLocaleString('vi-VN')}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            {[
              { title: 'Tổng scan',  value: stats.total,    color: '#1677ff' },
              { title: 'Đúng vị trí', value: stats.match,    color: '#52c41a' },
              { title: 'Sai vị trí',  value: stats.mismatch, color: '#faad14' },
              { title: 'Hàng lạ',    value: stats.extra,    color: '#ff4d4f' },
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
            title={<Space><ScanOutlined style={{ color: PRIMARY }} /><span>{t('scan.title')}</span></Space>}
          >
            <Row gutter={12}>
              <Col xs={24} md={9}>
                <Input
                  size='large' prefix={<BarcodeOutlined />}
                  placeholder={t('scan.imeiPlaceholder')}
                  value={imei} onChange={(e) => setImei(e.target.value)}
                  onPressEnter={handleScan} autoFocus
                />
              </Col>
              <Col xs={24} md={11}>
                <Select
                  size='large' style={{ width: '100%' }}
                  showSearch optionFilterProp='label'
                  placeholder={t('scan.locationPlaceholder')}
                  value={locationId} onChange={setLocationId}
                  options={locationOptions}
                />
              </Col>
              <Col xs={24} md={4}>
                <Button type='primary' size='large' block
                  icon={<PlusOutlined />} loading={scanning} onClick={handleScan}>
                  {t('scan.record')}
                </Button>
              </Col>
            </Row>
          </Card>

          <Card
            style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
            title={t('scan.historyTitle', { count: scans.length })}
            extra={
              <Button type='primary' icon={<CheckCircleOutlined />}
                loading={completing} onClick={handleComplete} disabled={scans.length === 0}>
                {t('scan.finish')}
              </Button>
            }
          >
            <Table
              rowKey='key' size='small' bordered
              columns={scanColumns} dataSource={scans}
              pagination={{ pageSize: 8 }}
              locale={{ emptyText: <Empty description={t('scan.empty')} /> }}
            />
          </Card>
        </>
      )}

      {step === 2 && summary && (
        <>
          <Card style={{ borderRadius: 12, marginBottom: 16, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <Descriptions size='small' column={{ xs: 1, sm: 2, md: 4 }}>
              <Descriptions.Item label='Phiên'><Text strong>#{summary.session.id}</Text></Descriptions.Item>
              <Descriptions.Item label='Kho'><Text strong>{summary.session.warehouseName ?? '—'}</Text></Descriptions.Item>
              <Descriptions.Item label='Người mở'>{summary.session.createdByUsername ?? '—'}</Descriptions.Item>
              <Descriptions.Item label='Kết thúc'>
                {summary.session.endDate ? new Date(summary.session.endDate).toLocaleString('vi-VN') : '—'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            {[
              { title: 'Đúng vị trí',  value: summary.matchCount,    color: '#52c41a' },
              { title: 'Sai vị trí',   value: summary.mismatchCount, color: '#faad14' },
              { title: 'Thiếu (chưa scan)', value: summary.missingCount, color: '#ff4d4f' },
              { title: 'Hàng lạ',     value: summary.extraCount,    color: '#722ed1' },
            ].map((s, i) => (
              <Col xs={12} xl={6} key={i}>
                <Card style={{ borderRadius: 12 }}>
                  <Statistic title={s.title} value={s.value} valueStyle={{ color: s.color, fontWeight: 700 }} />
                </Card>
              </Col>
            ))}
          </Row>

          <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <Tabs
              defaultActiveKey='all'
              items={[
                { key: 'all', label: `Tất cả (${summary.details.length})`,
                  children: <Table rowKey='detailId' size='small' bordered
                    columns={summaryColumns} dataSource={summary.details}
                    pagination={{ pageSize: 10 }} /> },
                { key: 'mismatch', label: `Sai vị trí (${summary.mismatchCount})`,
                  children: <Table rowKey='detailId' size='small' bordered
                    columns={summaryColumns}
                    dataSource={summary.details.filter((d) => d.status === 'MISMATCH')}
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: <Empty description='Không có sai vị trí' /> }} /> },
                { key: 'missing', label: `Thiếu (${summary.missingCount})`,
                  children: <Table rowKey='detailId' size='small' bordered
                    columns={summaryColumns}
                    dataSource={summary.details.filter((d) => d.status === 'MISSING')}
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: <Empty description='Không có IMEI thiếu' /> }} /> },
                { key: 'extra', label: `Hàng lạ (${summary.extraCount})`,
                  children: <Table rowKey='detailId' size='small' bordered
                    columns={summaryColumns}
                    dataSource={summary.details.filter((d) => d.status === 'EXTRA')}
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: <Empty description='Không có hàng lạ' /> }} /> },
              ]}
            />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Button type='primary' onClick={handleRestart}>{t('result.restart')}</Button>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

export default KiemKePage
