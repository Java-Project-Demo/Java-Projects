import { Card, DatePicker, Input, Select, Space, Table, Tag, Typography } from 'antd'
import { useState } from 'react'
import { SearchOutlined, UserOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import PageHeader from '@/components/shared/PageHeader.tsx'
import { useGetAuditLogsQuery } from '@/features/auditLog/auditLogApi.ts'
import type { AuditLog } from '@/types/api'

const { Text } = Typography
const { RangePicker } = DatePicker

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'magenta', LOGOUT: 'magenta', REFRESH_TOKEN: 'purple',
  CREATE_USER: 'green', UPDATE_USER: 'blue', UPDATE_USER_INFO: 'blue',
  UPDATE_USER_STATUS: 'cyan', UPDATE_ROLE: 'geekblue', DELETE_USER: 'red',
  CHANGE_PASSWORD: 'gold', RESET_PASSWORD: 'volcano',
  CREATE_SUPPLIER: 'green', UPDATE_SUPPLIER: 'blue', DELETE_SUPPLIER: 'red',
  CREATE_CATEGORY: 'green', UPDATE_CATEGORY: 'blue', DELETE_CATEGORY: 'red',
  CREATE_PRODUCT: 'green', UPDATE_PRODUCT: 'blue', DELETE_PRODUCT: 'red',
  CREATE_WAREHOUSE: 'green', IMPORT_STOCK: 'blue', ADJUST_STOCK: 'purple',
  MARK_DAMAGED: 'volcano',
  CREATE_ORDER: 'green', CANCEL_ORDER: 'red', COMPLETE_ORDER: 'cyan', RETURN_ORDER: 'orange',
  RECEIVE_WARRANTY: 'gold'
}

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: 'green', FAILED: 'red', DENIED: 'volcano', UNAUTHORIZED: 'purple', EXPIRED: 'orange'
}

const AuditLogPage = () => {
  const { t } = useTranslation(['auditLog', 'common'])
  const [filters, setFilters] = useState({
    page: 0,
    size: 50,
    action: undefined,
    entity: undefined,
    status: undefined
  })
  const { data: response, isLoading, isFetching } = useGetAuditLogsQuery(filters)

  const columns = [
    {
      title: t('table.time'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (v: string) => <Text type='secondary'>{v ? dayjs(v).format('DD/MM/YYYY HH:mm:ss') : '-'}</Text>
    },
    {
      title: t('table.actor'),
      key: 'actor',
      width: 200,
      render: (_: unknown, r: AuditLog) => {
        const name = r.staffName ?? r.staffUsername
        return (
          <Space>
            <UserOutlined style={{ fontSize: 12 }} />
            <div style={{ lineHeight: 1.3 }}>
              <Text strong>{name ?? t('table.system')}</Text>
              {r.staffName && r.staffUsername && (
                <div>
                  <Text type='secondary' style={{ fontSize: 11 }}>@{r.staffUsername}</Text>
                </div>
              )}
            </div>
          </Space>
        )
      }
    },
    {
      title: t('table.action'),
      dataIndex: 'action',
      key: 'action',
      width: 180,
      render: (v: string) => {
        const color = ACTION_COLORS[v] ?? 'default'
        const label = t(`action.${v}`, { defaultValue: v })
        return <Tag color={color}>{label}</Tag>
      }
    },
    {
      title: t('table.entity'),
      dataIndex: 'entityName',
      key: 'entity',
      width: 180,
      render: (v: string) => <Tag>{t(`entity.${v}`, { defaultValue: v })}</Tag>
    },
    {
      title: t('table.refId'),
      dataIndex: 'entityId',
      key: 'ref',
      width: 180,
      render: (v: string) => <Text code>{v}</Text>
    },
    {
      title: t('table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (v: string) => {
        const color = STATUS_COLORS[v] ?? 'default'
        const label = t(`common:status.log.${v}`, { defaultValue: v })
        return <Tag color={color}>{label}</Tag>
      }
    },
    {
      title: t('table.details'),
      dataIndex: 'details',
      key: 'message',
      render: (v: string) => <Text italic>{v}</Text>
    }
  ]

  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Space wrap size={16}>
          <div>
            <div style={{ marginBottom: 4 }}>
              <Text type='secondary'>{t('filter.action')}</Text>
            </div>
            <Select
              allowClear
              placeholder={t('filter.actionAll')}
              style={{ width: 180 }}
              options={Object.keys(ACTION_COLORS).map((key) => ({
                value: key,
                label: t(`action.${key}`, { defaultValue: key })
              }))}
              onChange={(v) => setFilters({ ...filters, action: v })}
            />
          </div>

          <div>
            <div style={{ marginBottom: 4 }}>
              <Text type='secondary'>{t('filter.time')}</Text>
            </div>
            <RangePicker showTime />
          </div>

          <div>
            <div style={{ marginBottom: 4 }}>
              <Text type='secondary'>{t('filter.search')}</Text>
            </div>
            <Input prefix={<SearchOutlined />} placeholder={t('filter.searchPlaceholder')} style={{ width: 250 }} />
          </div>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <Table
          dataSource={response}
          columns={columns}
          loading={isLoading || isFetching}
          rowKey='id'
          size='middle'
          pagination={{
            pageSize: filters.size,
            current: filters.page + 1,
            onChange: (p, s) => setFilters({ ...filters, page: p - 1, size: s }),
            showSizeChanger: true,
            showTotal: (total) => t('table.total', { count: total })
          }}
        />
      </Card>
    </div>
  )
}

export default AuditLogPage
