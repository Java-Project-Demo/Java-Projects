import { Card, DatePicker, Input, Select, Space, Table, Tag, Typography } from 'antd'
import { useState } from 'react'
import { SearchOutlined, UserOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import PageHeader from '@/components/shared/PageHeader.tsx'
import { useGetAuditLogsQuery } from '@/features/auditLog/auditLogApi.ts'

const { Text } = Typography
const { RangePicker } = DatePicker

const ACTION_CONFIG: Record<string, { label: string; color: string }> = {
  // --- AUTH ---
  LOGIN: { label: 'Đăng nhập', color: 'magenta' },
  LOGOUT: { label: 'Đăng xuất', color: 'magenta' },
  REFRESH_TOKEN: { label: 'Làm mới phiên', color: 'purple' },

  // --- USER ---
  CREATE_USER: { label: 'Tạo người dùng', color: 'green' },
  UPDATE_USER: { label: 'Cập nhật người dùng', color: 'blue' },
  UPDATE_USER_INFO: { label: 'Cập nhật thông tin cá nhân', color: 'blue' },
  UPDATE_USER_STATUS: { label: 'Cập nhật trạng thái người dùng', color: 'cyan' },
  UPDATE_ROLE: { label: 'Thay đổi quyền hạn', color: 'geekblue' },
  DELETE_USER: { label: 'Xoá người dùng', color: 'red' },
  CHANGE_PASSWORD: { label: 'Đổi mật khẩu', color: 'gold' },
  RESET_PASSWORD: { label: 'Đặt lại mật khẩu', color: 'volcano' },

  // --- SUPPLIER ---
  CREATE_SUPPLIER: { label: 'Thêm nhà cung cấp', color: 'green' },
  UPDATE_SUPPLIER: { label: 'Cập nhật nhà cung cấp', color: 'blue' },
  DELETE_SUPPLIER: { label: 'Xoá nhà cung cấp', color: 'red' },

  // --- CATEGORY ---
  CREATE_CATEGORY: { label: 'Thêm danh mục', color: 'green' },
  UPDATE_CATEGORY: { label: 'Cập nhật danh mục', color: 'blue' },
  DELETE_CATEGORY: { label: 'Xoá danh mục', color: 'red' },

  // --- WAREHOUSE / PRODUCT ---
  CREATE_PRODUCT: { label: 'Thêm sản phẩm', color: 'green' },
  UPDATE_PRODUCT: { label: 'Cập nhật sản phẩm', color: 'blue' },
  DELETE_PRODUCT: { label: 'Xoá sản phẩm', color: 'red' },
  CREATE_WAREHOUSE: { label: 'Thiết lập kho hàng', color: 'green' },
  IMPORT_STOCK: { label: 'Nhập kho', color: 'blue' },
  ADJUST_STOCK: { label: 'Điều chỉnh tồn kho', color: 'purple' },
  MARK_DAMAGED: { label: 'Báo hàng hỏng', color: 'volcano' },

  // --- ORDER ---
  CREATE_ORDER: { label: 'Tạo đơn hàng', color: 'green' },
  CANCEL_ORDER: { label: 'Huỷ đơn hàng', color: 'red' },
  COMPLETE_ORDER: { label: 'Hoàn thành đơn hàng', color: 'cyan' },
  RETURN_ORDER: { label: 'Khách trả hàng', color: 'orange' },

  // --- WARRANTY ---
  RECEIVE_WARRANTY: { label: 'Tiếp nhận bảo hành', color: 'gold' }
}

const ENTITY_CONFIG: Record<string, string> = {
  PRODUCT: 'Sản phẩm',
  PRODUCT_ITEM: 'IMEI',
  ORDER: 'Đơn hàng',
  SUPPLIER: 'Nhà cung cấp',
  WAREHOUSE: 'Kho hàng',
  AUTH: 'Xác thực hệ thống',
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  SUCCESS: { label: 'Thành công', color: 'green' },
  FAILED: { label: 'Thất bại', color: 'red' },
  DENIED: { label: 'Bị từ chối', color: 'volcano' },
  UNAUTHORIZED: { label: 'Không có quyền', color: 'purple' },
  EXPIRED: { label: 'Hết hạn', color: 'orange' }
}

const AuditLogPage = () => {
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
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (v: string) => <Text type='secondary'>{v ? dayjs(v).format('DD/MM/YYYY HH:mm:ss') : '-'}</Text>
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'actorName',
      key: 'actor',
      width: 180,
      render: (v: string) => (
        <Space>
          <UserOutlined style={{ fontSize: 12 }} />
          <Text strong>{v || 'Hệ thống'}</Text>
        </Space>
      )
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 180,
      render: (v: string) => {
        const config = ACTION_CONFIG[v] || { label: v, color: 'default' }
        return <Tag color={config.color}>{config.label}</Tag>
      }
    },
    {
      title: 'Đối tượng',
      dataIndex: 'entityName',
      key: 'entity',
      width: 180,
      render: (v: string) => <Tag>{ENTITY_CONFIG[v] || v}</Tag>
    },
    {
      title: 'ID Tham chiếu',
      dataIndex: 'entityId',
      key: 'ref',
      width: 180,
      render: (v: string) => <Text code>{v}</Text>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (v: string) => {
        const config = STATUS_CONFIG[v] || { label: v, color: 'default' }
        return <Tag color={config.color}>{config.label}</Tag>
      }
    },
    {
      title: 'Nội dung chi tiết',
      dataIndex: 'details',
      key: 'message',
      render: (v: string) => <Text italic>{v}</Text>
    }
  ]
  return (
    <div>
      <PageHeader
        title='Nhật ký hệ thống'
        subtitle='Theo dõi toàn bộ biến động dữ liệu và lịch sử thao tác của người dùng'
      />

      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Space wrap size={16}>
          <div>
            <div style={{ marginBottom: 4 }}>
              <Text type='secondary'>Hành động</Text>
            </div>
            <Select
              allowClear
              placeholder='Tất cả hành động'
              style={{ width: 180 }}
              options={Object.keys(ACTION_CONFIG).map((key) => ({
                value: key,
                label: ACTION_CONFIG[key].label
              }))}
              onChange={(v) => setFilters({ ...filters, action: v })}
            />
          </div>

          <div>
            <div style={{ marginBottom: 4 }}>
              <Text type='secondary'>Thời gian</Text>
            </div>
            <RangePicker showTime />
          </div>

          <div>
            <div style={{ marginBottom: 4 }}>
              <Text type='secondary'>Tìm kiếm</Text>
            </div>
            <Input prefix={<SearchOutlined />} placeholder='Tìm ID, nội dung...' style={{ width: 250 }} />
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
            showTotal: (total) => `Tổng cộng ${total} bản ghi`
          }}
        />
      </Card>
    </div>
  )
}

export default AuditLogPage
