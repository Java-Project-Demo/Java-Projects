import { useState, useMemo } from 'react'
import {
  App, Button, Card, Col, Form, Input, Modal, Row, Select,
  Space, Spin, Statistic, Table, Tag, Tooltip, Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined, EditOutlined, SafetyCertificateOutlined, DeleteOutlined,
  CheckCircleOutlined, WarningOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import {
  useGetWarrantiesQuery,
  useCreateWarrantyMutation,
  useUpdateWarrantyMutation,
} from '@/features/warranty/warrantyApi'
import { useLazyTraceImeiQuery } from '@/features/dashboard/dashboardApi'
import { useLocaleFormat } from '@/utils/useLocaleFormat'
import type { WarrantyResponse, WarrantyStatus, UpdateWarrantyRequest } from '@/types/api'
import { useCan } from '@/utils/permissions'

const { Text } = Typography
const PRIMARY = '#E8603C'

const STATUS_COLORS: Record<WarrantyStatus, string> = {
  RECEIVED: 'blue', FIXING: 'orange', FIXED: 'green', RETURNED: 'default', UNFIXABLE: 'red',
}
const STATUS_KEYS: WarrantyStatus[] = ['RECEIVED', 'FIXING', 'FIXED', 'RETURNED', 'UNFIXABLE']

interface ImeiEntry {
  imei: string
  productName?: string
  customerName?: string
  itemStatus?: string
  warrantyExpiry?: string | null
  warning?: string
}

interface TraceResp {
  itemInfo?: {
    imei?: string
    status?: string
    orderId?: number | null
    warrantyExpiryDate?: string | null
  } | null
  productInfo?: { name?: string } | null
  saleInfo?: { customer?: { fullName?: string | null } } | null
}

const BaoHanhPage = () => {
  const { message } = App.useApp()
  const { t } = useTranslation(['warranty', 'common'])
  const { date } = useLocaleFormat()
  const canCreate = useCan('WARRANTY_CREATE')
  const canUpdate = useCan('WARRANTY_UPDATE')

  const [filterStatus, setFilterStatus] = useState<WarrantyStatus | undefined>()
  const [createOpen, setCreateOpen] = useState(false)
  const [updateTarget, setUpdateTarget] = useState<WarrantyResponse | null>(null)
  const [imeiInput, setImeiInput] = useState('')
  const [imeiEntries, setImeiEntries] = useState<ImeiEntry[]>([])
  const [createForm] = Form.useForm()
  const [updateForm] = Form.useForm<{ status: WarrantyStatus; technicalNote?: string }>()

  const { data: warranties = [], isLoading } = useGetWarrantiesQuery()
  const [createWarranty, { isLoading: creating }] = useCreateWarrantyMutation()
  const [updateWarranty, { isLoading: updating }] = useUpdateWarrantyMutation()
  const [triggerTrace, { isFetching: tracing }] = useLazyTraceImeiQuery()

  const filtered = useMemo(
    () => (!filterStatus ? warranties : warranties.filter((w) => w.status === filterStatus)),
    [warranties, filterStatus],
  )

  const stats = useMemo(() => ({
    total: warranties.length,
    active: warranties.filter((w) => w.status === 'FIXING' || w.status === 'RECEIVED').length,
    fixed: warranties.filter((w) => w.status === 'FIXED').length,
    unfixable: warranties.filter((w) => w.status === 'UNFIXABLE').length,
  }), [warranties])

  const handleAddImei = async () => {
    const v = imeiInput.trim()
    if (!v) return
    if (imeiEntries.some((e) => e.imei === v)) {
      void message.warning(t('create.imeiDuplicate'))
      return
    }
    try {
      const raw = await triggerTrace(v).unwrap()
      const trace = raw as TraceResp
      const item = trace.itemInfo
      if (!item) {
        void message.error(t('create.imeiNotFound', { imei: v }))
        return
      }
      const expiry = item.warrantyExpiryDate
      const isExpired = expiry ? new Date(expiry) < new Date() : false
      const hasOrder = item.orderId != null || trace.saleInfo != null

      let warning: string | undefined
      if (!hasOrder) warning = t('create.warningNotSold')
      else if (isExpired) warning = t('create.warningExpired', { date: date(expiry!) })

      setImeiEntries((p) => [...p, {
        imei: v,
        productName: trace.productInfo?.name ?? undefined,
        customerName: trace.saleInfo?.customer?.fullName ?? undefined,
        itemStatus: item.status,
        warrantyExpiry: expiry,
        warning,
      }])
      setImeiInput('')
    } catch {
      void message.error(t('create.imeiTraceFail', { imei: v }))
    }
  }

  const openCreate = () => {
    createForm.resetFields()
    setImeiEntries([])
    setImeiInput('')
    setCreateOpen(true)
  }

  const handleCreate = () => {
    createForm.validateFields().then(async (values) => {
      if (imeiEntries.length === 0) {
        void message.error(t('create.imeiNeedOne'))
        return
      }
      const blocking = imeiEntries.filter((e) => e.warning)
      if (blocking.length > 0) {
        void message.error(t('create.imeiBlocked', { count: blocking.length }))
        return
      }
      try {
        await createWarranty({
          imeis: imeiEntries.map((e) => e.imei),
          issue: values.issue as string,
        }).unwrap()
        void message.success(t('create.success', { count: imeiEntries.length }))
        setCreateOpen(false)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? t('common:error.system'))
      }
    })
  }

  const openUpdate = (r: WarrantyResponse) => {
    setUpdateTarget(r)
    updateForm.setFieldsValue({ status: r.status, technicalNote: r.technicalNote ?? '' })
  }

  const handleUpdate = () => {
    updateForm.validateFields().then(async (values) => {
      if (!updateTarget) return
      const payload: UpdateWarrantyRequest = {
        claimId: updateTarget.id,
        status: values.status,
        technicalNote: values.technicalNote,
      }
      try {
        await updateWarranty(payload).unwrap()
        void message.success(t('update.success'))
        setUpdateTarget(null)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? t('common:error.system'))
      }
    })
  }

  const columns: ColumnsType<WarrantyResponse> = [
    { title: t('col.id'), dataIndex: 'id', key: 'id', width: 60 },
    {
      title: t('col.product'), key: 'product', width: 220,
      render: (_, r) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{r.productName ?? '—'}</Text>
          <br />
          <Text type='secondary' style={{ fontSize: 11 }}>
            IMEI: <Text code>{r.imei ?? '—'}</Text>
          </Text>
        </div>
      ),
    },
    {
      title: t('col.customer'), key: 'customer', width: 180,
      render: (_, r) => (
        <div>
          <Text style={{ fontSize: 13 }}>{r.customerName ?? '—'}</Text>
          {r.customerPhone && <><br /><Text type='secondary' style={{ fontSize: 11 }}>{r.customerPhone}</Text></>}
        </div>
      ),
    },
    {
      title: t('col.issue'), dataIndex: 'issueDescription', key: 'issue', ellipsis: true,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: t('col.status'), dataIndex: 'status', key: 'status', width: 140,
      render: (v: WarrantyStatus) => (
        <Tag color={STATUS_COLORS[v] ?? 'default'}>{t(`common:status.warranty.${v}`, { defaultValue: v })}</Tag>
      ),
    },
    {
      title: t('col.receivedDate'), dataIndex: 'receivedDate', key: 'received', width: 110,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{date(v)}</Text>,
    },
    {
      title: t('col.staff'), key: 'staff', width: 130,
      render: (_, r) => <Text style={{ fontSize: 12 }}>{r.staffName ?? r.staffUsername ?? '—'}</Text>,
    },
    {
      title: t('col.actions'), key: 'action', width: 80, fixed: 'right',
      render: (_, record) => canUpdate ? (
        <Tooltip title={t('tooltip.update')}>
          <Button type='text' size='small' icon={<EditOutlined style={{ color: '#1677ff' }} />}
            onClick={() => openUpdate(record)} />
        </Tooltip>
      ) : null,
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        extra={
          canCreate ? (
            <Button type='primary' icon={<PlusOutlined />} onClick={openCreate}>
              {t('createButton')}
            </Button>
          ) : undefined
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: t('stats.total'), value: stats.total, color: PRIMARY },
          { title: t('stats.active'), value: stats.active, color: '#faad14' },
          { title: t('stats.fixed'), value: stats.fixed, color: '#52c41a' },
          { title: t('stats.unfixable'), value: stats.unfixable, color: '#ff4d4f' },
        ].map((s, i) => (
          <Col xs={12} xl={6} key={i}>
            <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <Statistic title={s.title} value={s.value} valueStyle={{ color: s.color, fontWeight: 700 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
        title={<Space><SafetyCertificateOutlined style={{ color: PRIMARY }} /><span>{t('listTitle')}</span></Space>}
        extra={
          <Select placeholder={t('filter')} allowClear style={{ width: 180 }}
            value={filterStatus} onChange={setFilterStatus}
            options={STATUS_KEYS.map((v) => ({ value: v, label: t(`common:status.warranty.${v}`) }))}
          />
        }
      >
        <Table
          rowKey='id' loading={isLoading} columns={columns} dataSource={filtered}
          size='middle' bordered scroll={{ x: 1100 }}
          pagination={{ pageSize: 10, showTotal: (total) => t('totalSuffix', { count: total }) }}
          locale={{ emptyText: <EmptyState title={t('empty.title')} description={t('empty.description')} action={canCreate ? { label: t('empty.action'), onClick: openCreate } : undefined} /> }}
        />
      </Card>

      <Modal title={t('create.title')} open={createOpen} onCancel={() => setCreateOpen(false)} width={640}
        footer={[
          <Button key='c' onClick={() => setCreateOpen(false)}>{t('common:button.cancel')}</Button>,
          <Button key='s' type='primary' loading={creating} onClick={handleCreate}>
            {imeiEntries.length > 0 ? t('create.submitWithCount', { count: imeiEntries.length }) : t('create.submit')}
          </Button>,
        ]}>
        <Form form={createForm} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label={t('create.imeiHeader')}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Input autoFocus placeholder={t('create.imeiPlaceholder')}
                value={imeiInput} onChange={(e) => setImeiInput(e.target.value)}
                onPressEnter={handleAddImei}
                disabled={tracing}
                style={{ flex: 1 }} />
              <Button icon={tracing ? <Spin size='small' /> : <PlusOutlined />}
                onClick={handleAddImei} loading={tracing}>
                {t('create.imeiAdd')}
              </Button>
            </div>
            {imeiEntries.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {imeiEntries.map((e) => {
                  const isBlocked = !!e.warning
                  return (
                    <div key={e.imei} style={{
                      padding: '8px 12px', borderRadius: 6,
                      background: isBlocked ? '#fff1f0' : '#f6ffed',
                      border: `1px solid ${isBlocked ? '#ffa39e' : '#b7eb8f'}`,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8,
                    }}>
                      <div style={{ flex: 1 }}>
                        <Space size={6} style={{ marginBottom: 2 }}>
                          {isBlocked ? <WarningOutlined style={{ color: '#cf1322' }} /> : <CheckCircleOutlined style={{ color: '#389e0d' }} />}
                          <Text code style={{ fontSize: 12 }}>{e.imei}</Text>
                          {e.productName && <Text strong style={{ fontSize: 12 }}>· {e.productName}</Text>}
                        </Space>
                        <div>
                          {e.customerName && <Text type='secondary' style={{ fontSize: 11 }}>{t('create.customerLabel')} {e.customerName} · </Text>}
                          {e.itemStatus && <Tag style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>{t(`common:status.item.${e.itemStatus}`, { defaultValue: e.itemStatus })}</Tag>}
                          {e.warrantyExpiry && (
                            <Text type='secondary' style={{ fontSize: 11, marginLeft: 6 }}>
                              {t('create.expiryLabel', { date: date(e.warrantyExpiry) })}
                            </Text>
                          )}
                        </div>
                        {e.warning && (
                          <Text type='danger' style={{ fontSize: 11, fontWeight: 600 }}>⚠ {e.warning}</Text>
                        )}
                      </div>
                      <Button type='text' size='small' danger icon={<DeleteOutlined />}
                        onClick={() => setImeiEntries((p) => p.filter((x) => x.imei !== e.imei))} />
                    </div>
                  )
                })}
              </div>
            ) : (
              <Text type='secondary' style={{ fontSize: 12 }}>{t('create.imeiEmpty')}</Text>
            )}
          </Form.Item>
          <Form.Item label={t('create.issue')} name='issue' rules={[{ required: true, message: t('create.issueRequired') }]}>
            <Input.TextArea rows={3} placeholder={t('create.issuePlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={t('update.title')} open={!!updateTarget} onCancel={() => setUpdateTarget(null)} width={480}
        footer={[
          <Button key='c' onClick={() => setUpdateTarget(null)}>{t('common:button.cancel')}</Button>,
          <Button key='s' type='primary' loading={updating} onClick={handleUpdate}>{t('update.submit')}</Button>,
        ]}>
        <Form form={updateForm} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label={t('update.status')} name='status' rules={[{ required: true, message: t('update.statusRequired') }]}>
            <Select options={STATUS_KEYS.map((v) => ({ value: v, label: t(`common:status.warranty.${v}`) }))} />
          </Form.Item>
          <Form.Item label={t('update.note')} name='technicalNote'>
            <Input.TextArea rows={3} placeholder={t('update.notePlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BaoHanhPage
