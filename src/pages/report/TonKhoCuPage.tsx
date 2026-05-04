import { useState } from 'react'
import {
  App, Button, Card, InputNumber, Space, Table, Tag, Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { WarningOutlined } from '@ant-design/icons'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import { useLazyGetAgingReportQuery } from '@/features/dashboard/dashboardApi'
import { useMarkDamagedMutation } from '@/features/stock/stockApi'
import type { ProductItem } from '@/types/api'

const { Text } = Typography
const PRIMARY = '#E8603C'

const daysSince = (dateStr: string | null) => {
  if (!dateStr) return null
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

const TonKhoCuPage = () => {
  const { message, modal } = App.useApp()
  const [days, setDays] = useState(90)
  const [trigger, { data = [], isLoading, isFetching }] = useLazyGetAgingReportQuery()
  const [markDamaged, { isLoading: marking }] = useMarkDamagedMutation()

  const handleSearch = () => { void trigger({ daysThreshold: days }) }

  const handleMarkDamaged = (imei: string) => {
    modal.confirm({
      title: 'Đánh dấu hỏng',
      content: `Xác nhận đánh dấu IMEI ${imei} là hàng hỏng?`,
      okText: 'Xác nhận', okButtonProps: { danger: true },
      cancelText: 'Huỷ',
      onOk: async () => {
        try {
          await markDamaged({ imei }).unwrap()
          void message.success(`Đã đánh dấu IMEI ${imei} là hàng hỏng`)
        } catch (err: unknown) {
          const e = err as { data?: { message?: string } }
          void message.error(e?.data?.message ?? 'Lỗi hệ thống')
        }
      },
    })
  }

  const columns: ColumnsType<ProductItem> = [
    {
      title: 'IMEI', dataIndex: 'imei', key: 'imei',
      render: (v: string) => <Text code>{v}</Text>,
    },
    {
      title: 'Ngày nhập', dataIndex: 'importDate', key: 'importDate', width: 130,
      render: (v: string | null) => <Text style={{ fontSize: 12 }}>{v ? new Date(v).toLocaleDateString('vi-VN') : '—'}</Text>,
    },
    {
      title: 'Số ngày tồn', key: 'days', width: 120,
      render: (_, r) => {
        const d = daysSince(r.importDate)
        if (d === null) return '—'
        return (
          <Tag color={d > 180 ? 'red' : d > 90 ? 'orange' : 'default'}>
            {d} ngày
          </Tag>
        )
      },
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120,
      render: (v: string) => (
        <Tag color={v === 'AVAILABLE' ? 'green' : v === 'DAMAGED' ? 'red' : 'default'}>{v}</Tag>
      ),
    },
    {
      title: 'Hành động', key: 'action', width: 130,
      render: (_, r) => r.status === 'AVAILABLE' ? (
        <Button size='small' danger loading={marking}
          icon={<WarningOutlined />}
          onClick={() => handleMarkDamaged(r.imei)}>
          Đánh dấu hỏng
        </Button>
      ) : null,
    },
  ]

  return (
    <div>
      <PageHeader
        title='Báo cáo tồn kho cũ'
        subtitle='Danh sách IMEI tồn kho lâu ngày chưa được bán'
      />

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 20 }}>
        <Space size={12} wrap>
          <Text strong>Hiển thị IMEI tồn kho hơn</Text>
          <InputNumber
            min={1} max={3650} value={days}
            onChange={(v) => setDays(v ?? 90)}
            addonAfter='ngày'
            style={{ width: 160 }}
          />
          <Button type='primary' loading={isLoading || isFetching} onClick={handleSearch}>
            Tải báo cáo
          </Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
        title={
          <Space>
            <WarningOutlined style={{ color: PRIMARY }} />
            <span>Tồn kho cũ ({data.length} IMEI)</span>
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
          pagination={{ pageSize: 20, showTotal: (t) => `${t} IMEI` }}
          locale={{ emptyText: <EmptyState title='Không có dữ liệu' description='Nhấn "Tải báo cáo" để xem danh sách tồn kho cũ' /> }}
        />
      </Card>
    </div>
  )
}

export default TonKhoCuPage
