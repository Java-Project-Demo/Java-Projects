import { useState } from 'react'
import {
  App, Avatar, Button, Card, Form, Input, Modal,
  Select, Space, Table, Tag, Tooltip, Typography, Switch,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, EditOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'
import {
  useGetUsersQuery, useCreateUserMutation,
  useUpdateUserInfoMutation, useResetPasswordMutation,
  useUpdateUserStatusMutation,
} from '@/features/user/userApi'
import type { User } from '@/types/api'
import PageHeader from '@/components/shared/PageHeader'

const { Text } = Typography
const PRIMARY = '#E8603C'

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  ADMIN: { label: 'Quản trị viên', color: 'red' },
  SALES: { label: 'Kinh doanh',    color: 'green' },
  STOCK: { label: 'Thủ kho',       color: 'blue' },
}

const COLORS = ['#E8603C', '#1677ff', '#52c41a', '#faad14', '#722ed1', '#13c2c2']
const avatarColor = (name: string) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]

interface CreateValues { fullName: string; roleName: string }
interface EditValues { fullName?: string; phoneNumber?: string }

const NhanVienPage = () => {
  const { message } = App.useApp()
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<string | undefined>()
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<User | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<User | null>(null)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [createForm] = Form.useForm<CreateValues>()
  const [editForm] = Form.useForm<EditValues>()

  const { data: pageData, isLoading } = useGetUsersQuery({ page: page - 1, size: 10 })
  const users = pageData?.content ?? []
  const total = pageData?.pagination?.totalElements ?? 0

  const [createUser, { isLoading: creating }] = useCreateUserMutation()
  const [updateUserInfo, { isLoading: updating }] = useUpdateUserInfoMutation()
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation()
  const [updateUserStatus, { isLoading: togglingStatus }] = useUpdateUserStatusMutation()

  const filtered = users.filter((u) => {
    const ms = !search ||
      (u.fullName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
    const mr = !filterRole || u.role === filterRole
    return ms && mr
  })

  const openCreate = () => { createForm.resetFields(); setCreateOpen(true) }
  const openEdit = (u: User) => {
    setEditItem(u)
    editForm.setFieldsValue({ fullName: u.fullName ?? '', phoneNumber: u.phoneNumber ?? '' })
    setEditOpen(true)
  }

  const handleCreate = () => {
    createForm.validateFields().then(async (values) => {
      try {
        await createUser({ fullName: values.fullName, roleName: values.roleName, status: 'ACTIVE' }).unwrap()
        void message.success('Tạo nhân viên thành công!')
        setCreateOpen(false)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? 'Lỗi hệ thống')
      }
    })
  }

  const handleEdit = () => {
    editForm.validateFields().then(async (values) => {
      if (!editItem) return
      try {
        await updateUserInfo({ id: editItem.id, data: values }).unwrap()
        void message.success('Cập nhật thành công!')
        setEditOpen(false)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? 'Lỗi hệ thống')
      }
    })
  }

  const handleResetPassword = async () => {
    if (!resetTarget) return
    try {
      const pwd = await resetPassword(resetTarget.id).unwrap()
      setTempPassword(typeof pwd === 'string' ? pwd : JSON.stringify(pwd))
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      void message.error(e?.data?.message ?? 'Lỗi reset mật khẩu')
    }
  }

  const handleToggleStatus = async (u: User) => {
    const newActive = u.status !== 'ACTIVE'
    try {
      await updateUserStatus({ id: u.id, active: newActive }).unwrap()
      void message.success(`Đã ${newActive ? 'mở khoá' : 'khoá'} tài khoản ${u.username}`)
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      void message.error(e?.data?.message ?? 'Lỗi hệ thống')
    }
  }

  const columns: ColumnsType<User> = [
    {
      title: 'Nhân viên', key: 'user', width: 240,
      render: (_, r) => (
        <Space>
          <Avatar size={36} style={{ background: avatarColor(r.username), flexShrink: 0 }}>
            {(r.fullName ?? r.username).charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.fullName ?? '—'}</div>
            <Text type='secondary' style={{ fontSize: 12 }}><UserOutlined /> {r.username}</Text>
          </div>
        </Space>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true, render: (v: string | null) => <Text type='secondary'>{v ?? '—'}</Text> },
    { title: 'Điện thoại', dataIndex: 'phoneNumber', key: 'phone', width: 130, render: (v: string | null) => v ?? '—' },
    {
      title: 'Vai trò', dataIndex: 'role', key: 'role', width: 140,
      render: (v: string) => { const cfg = ROLE_CONFIG[v] ?? { label: v, color: 'default' }; return <Tag color={cfg.color}>{cfg.label}</Tag> },
    },
    {
      title: 'Trạng thái', key: 'status', width: 120,
      render: (_, r: User) => r.isDeleted
        ? <Tag color='red'>Đã xoá</Tag>
        : <Switch size='small' loading={togglingStatus} checked={r.status === 'ACTIVE' || !r.status}
            checkedChildren='Active' unCheckedChildren='Khoá'
            onChange={() => handleToggleStatus(r)} />,
    },
    {
      title: 'Đặt lại MK', key: 'resetPwd', width: 100,
      render: (_, r: User) => r.isPasswordReset
        ? <Tag color='orange'>Đã đặt lại</Tag>
        : <Tag>Chưa</Tag>,
    },
    {
      title: 'Ngày tạo', dataIndex: 'createdAt', key: 'created', width: 120,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v ? new Date(v).toLocaleDateString('vi-VN') : '—'}</Text>,
    },
    {
      title: 'Hành động', key: 'action', width: 90,
      render: (_, record) => (
        <Space size={2}>
          <Tooltip title='Sửa thông tin'>
            <Button type='text' size='small' icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title='Đặt lại mật khẩu'>
            <Button type='text' size='small' icon={<LockOutlined style={{ color: '#faad14' }} />}
              onClick={() => { setResetTarget(record); setTempPassword(null) }} />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title='Quản lý nhân viên'
        extra={<Button type='primary' icon={<PlusOutlined />} onClick={openCreate}>Thêm nhân viên</Button>}
      />

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input.Search placeholder='Tìm tên, username...' style={{ width: 240 }}
            value={search} onChange={(e) => setSearch(e.target.value)} allowClear />
          <Select placeholder='Vai trò' style={{ width: 150 }} allowClear value={filterRole} onChange={setFilterRole}
            options={Object.entries(ROLE_CONFIG).map(([v, { label }]) => ({ value: v, label }))} />
        </div>

        <Table rowKey='id' loading={isLoading} columns={columns} dataSource={filtered}
          size='middle' bordered
          pagination={{
            current: page, total, pageSize: 10,
            onChange: setPage,
            showTotal: (t) => `Tổng ${t} nhân viên`,
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal title='Thêm nhân viên mới' open={createOpen} onCancel={() => setCreateOpen(false)} width={480}
        footer={[
          <Button key='c' onClick={() => setCreateOpen(false)}>Huỷ</Button>,
          <Button key='s' type='primary' loading={creating} onClick={handleCreate}>Tạo nhân viên</Button>,
        ]}>
        <Form form={createForm} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label='Họ và tên' name='fullName' rules={[{ required: true, message: 'Nhập họ tên' }]}>
            <Input autoFocus placeholder='Nguyễn Văn A' />
          </Form.Item>
          <Form.Item label='Vai trò' name='roleName' rules={[{ required: true, message: 'Chọn vai trò' }]}>
            <Select options={Object.entries(ROLE_CONFIG).map(([v, { label }]) => ({ value: v, label }))} />
          </Form.Item>
          <Text type='secondary' style={{ fontSize: 12 }}>
            Username và mật khẩu tạm thời sẽ được hệ thống tự tạo từ họ tên.
          </Text>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal title='Cập nhật thông tin' open={editOpen} onCancel={() => setEditOpen(false)} width={480}
        footer={[
          <Button key='c' onClick={() => setEditOpen(false)}>Huỷ</Button>,
          <Button key='s' type='primary' loading={updating} onClick={handleEdit}>Cập nhật</Button>,
        ]}>
        <Form form={editForm} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label='Họ và tên' name='fullName'><Input autoFocus /></Form.Item>
          <Form.Item label='Số điện thoại' name='phoneNumber'><Input placeholder='09xxxxxxxx' /></Form.Item>
        </Form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        title={<Space><LockOutlined style={{ color: '#faad14' }} /><span>Đặt lại mật khẩu</span></Space>}
        open={!!resetTarget} onCancel={() => { setResetTarget(null); setTempPassword(null) }}
        footer={tempPassword ? [
          <Button key='close' type='primary' onClick={() => { setResetTarget(null); setTempPassword(null) }}>Đóng</Button>,
        ] : [
          <Button key='c' onClick={() => { setResetTarget(null); setTempPassword(null) }}>Huỷ</Button>,
          <Button key='r' danger loading={resetting} onClick={handleResetPassword}>Xác nhận đặt lại</Button>,
        ]}
        width={440}
      >
        {tempPassword ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <Text>Mật khẩu tạm thời cho <strong>{resetTarget?.username}</strong>:</Text>
            <div style={{ fontSize: 24, fontWeight: 700, color: PRIMARY, margin: '12px 0', letterSpacing: 2 }}>{tempPassword}</div>
            <Text type='secondary'>Nhân viên cần đổi mật khẩu khi đăng nhập lần tiếp theo.</Text>
          </div>
        ) : (
          <Text>Bạn có chắc muốn đặt lại mật khẩu cho <strong>{resetTarget?.username}</strong>?</Text>
        )}
      </Modal>
    </div>
  )
}

export default NhanVienPage
