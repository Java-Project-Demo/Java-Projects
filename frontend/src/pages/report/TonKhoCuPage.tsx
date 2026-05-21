import { useState } from 'react'
import {
  App, Button, Card, Form, Input, InputNumber, Modal, Space, Table, Tag, Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { WarningOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import { useLazyGetAgingReportQuery } from '@/features/dashboard/dashboardApi'
import { useMarkDamagedMutation } from '@/features/stock/stockApi'
import { useLocaleFormat } from '@/utils/useLocaleFormat'
import type { ProductItem } from '@/types/api'

const { Text } = Typography
const PRIMARY = '#E8603C'

const daysSince = (dateStr: string | null) => {
  if (!dateStr) return null
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

const TonKhoCuPage = () => {
  const { message } = App.useApp()
  const { t } = useTranslation(['oldStock', 'common'])
  const { date } = useLocaleFormat()
  const [days, setDays] = useState(90)
  const [trigger, { data = [], isLoading, isFetching }] = useLazyGetAgingReportQuery()
  const [markDamaged, { isLoading: marking }] = useMarkDamagedMutation()
  const [damagedTarget, setDamagedTarget] = useState<string | null>(null)
  const [damagedForm] = Form.useForm<{ reason: string }>()

  const handleSearch = () => { void trigger({ daysThreshold: days }) }

  const openMarkDamaged = (imei: string) => {
    damagedForm.resetFields()
    setDamagedTarget(imei)
  }

  const handleMarkDamaged = () => {
    if (!damagedTarget) return
    damagedForm.validateFields().then(async ({ reason }) => {
      try {
        await markDamaged({ imei: damagedTarget, reason: reason.trim() }).unwrap()
        void message.success(t('markDamaged.success', { imei: damagedTarget }))
        setDamagedTarget(null)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? t('common:error.system'))
      }
    })
  }

  const columns: ColumnsType<ProductItem> = [
    {
      title: t('col.imei'), dataIndex: 'imei', key: 'imei',
      render: (v: string) => <Text code>{v}</Text>,
    },
    {
      title: t('col.importDate'), dataIndex: 'importDate', key: 'importDate', width: 130,
      render: (v: string | null) => <Text style={{ fontSize: 12 }}>{date(v)}</Text>,
    },
    {
      title: t('col.daysOld'), key: 'days', width: 120,
      render: (_, r) => {
        const d = daysSince(r.importDate)
        if (d === null) return '—'
        return (
          <Tag color={d > 180 ? 'red' : d > 90 ? 'orange' : 'default'}>
            {d} {t('col.daysSuffix')}
          </Tag>
        )
      },
    },
    {
      title: t('col.status'), dataIndex: 'status', key: 'status', width: 120,
      render: (v: string) => (
        <Tag color={v === 'AVAILABLE' ? 'green' : v === 'DAMAGED' ? 'red' : 'default'}>
          {t(`common:status.item.${v}`, { defaultValue: v })}
        </Tag>
      ),
    },
    {
      title: t('col.action'), key: 'action', width: 130,
      render: (_, r) => r.status === 'AVAILABLE' ? (
        <Button size='small' danger
          icon={<WarningOutlined />}
          onClick={() => openMarkDamaged(r.imei)}>
          {t('markDamaged.button')}
        </Button>
      ) : null,
    },
  ]

  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 20 }}>
        <Space size={12} wrap>
          <Text strong>{t('filter.label')}</Text>
          <InputNumber
            min={1} max={3650} value={days}
            onChange={(v) => {
              if (v == null) return
              const n = Math.floor(Number(v))
              if (!Number.isFinite(n)) return
              setDays(Math.min(Math.max(n, 1), 3650))
            }}
            parser={(s) => Number((s ?? '').replace(/[^0-9]/g, '')) || 1}
            addonAfter={t('filter.unit')}
            style={{ width: 160 }}
          />
          <Button type='primary' loading={isLoading || isFetching} onClick={handleSearch}>
            {t('filter.submit')}
          </Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
        title={
          <Space>
            <WarningOutlined style={{ color: PRIMARY }} />
            <span>{t('tableTitle', { count: data.length })}</span>
          </Space>
        }
      >
        <Table
          rowKey='id' loading={isLoading || isFetching}
          columns={columns} dataSource={data}
          size='middle' bordered
          onRow={(r) => ({
            style: {
              background: daysSince(r.importDate) !== null && daysSince(r.importDate)! > 180
                ? '#fff1f0'
                : undefined,
            },
          })}
          pagination={{ pageSize: 20, showTotal: (total) => t('totalSuffix', { count: total }) }}
          locale={{ emptyText: <EmptyState title={t('empty.title')} description={t('empty.description')} /> }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: '#cf1322' }} />
            <span>{t('markDamaged.title')}</span>
          </Space>
        }
        open={damagedTarget !== null}
        onCancel={() => setDamagedTarget(null)}
        width={480}
        footer={[
          <Button key='c' onClick={() => setDamagedTarget(null)}>
            {t('common:button.cancel')}
          </Button>,
          <Button key='s' type='primary' danger loading={marking} onClick={handleMarkDamaged}>
            {t('common:button.confirm')}
          </Button>,
        ]}
      >
        <div style={{ marginTop: 12 }}>
          <Text>
            {t('markDamaged.content', { imei: damagedTarget ?? '' })}
          </Text>
          <Form form={damagedForm} layout='vertical' style={{ marginTop: 16 }}>
            <Form.Item
              label={t('markDamaged.reasonLabel', { defaultValue: 'Lý do hỏng' })}
              name='reason'
              rules={[
                { required: true, message: t('markDamaged.reasonRequired', { defaultValue: 'Vui lòng nhập lý do hỏng' }) },
                { min: 5, message: t('markDamaged.reasonMin', { defaultValue: 'Tối thiểu 5 ký tự' }) },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder={t('markDamaged.reasonPlaceholder', { defaultValue: 'VD: Màn hình vỡ, không lên nguồn, vào nước...' })}
                autoFocus
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  )
}

export default TonKhoCuPage
