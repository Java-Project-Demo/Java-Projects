import { useState } from 'react'
import {
  App, Avatar, Button, Card, Form, Input, Modal,
  Select, Space, Table, Tag, Tooltip, Typography, Switch,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, EditOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'
import { Trans, useTranslation } from 'react-i18next'
import {
  useGetUsersQuery, useCreateUserMutation,
  useUpdateUserInfoMutation, useResetPasswordMutation,
  useUpdateUserStatusMutation, useUpdateUserRoleMutation,
} from '@/features/user/userApi'
import type { User } from '@/types/api'
import PageHeader from '@/components/shared/PageHeader'
import { useLocaleFormat } from '@/utils/useLocaleFormat'

const { Text } = Typography
const PRIMARY = '#E8603C'

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'red', SALES: 'green', STOCK: 'blue',
}

const ASSIGNABLE_ROLES = ['SALES', 'STOCK'] as const

const COLORS = ['#E8603C', '#1677ff', '#52c41a', '#faad14', '#722ed1', '#13c2c2']
const avatarColor = (name: string) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]

interface CreateValues { fullName: string; email?: string; roleName: string }
interface EditValues { fullName?: string; phoneNumber?: string }

const NhanVienPage = () => {
  const { message } = App.useApp()
  const { t } = useTranslation(['employee', 'common'])
  const { date } = useLocaleFormat()
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<string | undefined>()
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<User | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<User | null>(null)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [changingRoleId, setChangingRoleId] = useState<number | null>(null)
  const [createForm] = Form.useForm<CreateValues>()
  const [editForm] = Form.useForm<EditValues>()

  const { data: pageData, isLoading } = useGetUsersQuery({ page: page - 1, size: 10 })
  const users = pageData?.content ?? []
  const total = pageData?.pagination?.totalElements ?? 0

  const [createUser, { isLoading: creating }] = useCreateUserMutation()
  const [updateUserInfo, { isLoading: updating }] = useUpdateUserInfoMutation()
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation()
  const [updateUserStatus] = useUpdateUserStatusMutation()
  const [updateUserRole] = useUpdateUserRoleMutation()

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
        const created = await createUser({
          fullName: values.fullName,
          email: values.email?.trim() || undefined,
          roleName: values.roleName,
          status: 'ACTIVE',
        }).unwrap()
        setCreateOpen(false)
        if (created.tempPassword) {
          setResetTarget(created)
          setTempPassword(created.tempPassword)
        } else {
          void message.success(t('create.success'))
        }
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? t('common:error.system'))
      }
    })
  }

  const handleEdit = () => {
    editForm.validateFields().then(async (values) => {
      if (!editItem) return
      try {
        await updateUserInfo({ id: editItem.id, data: values }).unwrap()
        void message.success(t('edit.success'))
        setEditOpen(false)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? t('common:error.system'))
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
      void message.error(e?.data?.message ?? t('reset.fail'))
    }
  }

  const handleToggleStatus = async (u: User) => {
    const newActive = u.status !== 'ACTIVE'
    setTogglingId(u.id)
    try {
      await updateUserStatus({ id: u.id, active: newActive }).unwrap()
      void message.success(newActive
        ? t('toggleStatus.successUnlock', { username: u.username })
        : t('toggleStatus.successLock', { username: u.username }))
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      void message.error(e?.data?.message ?? t('common:error.system'))
    } finally {
      setTogglingId(null)
    }
  }

  const handleChangeRole = async (u: User, roleName: string) => {
    if (roleName === u.role) return
    setChangingRoleId(u.id)
    try {
      await updateUserRole({ id: u.id, roleName }).unwrap()
      void message.success(t('changeRole.success', { username: u.username, role: t(`common:status.role.${roleName}`, { defaultValue: roleName }) }))
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      void message.error(e?.data?.message ?? t('common:error.system'))
    } finally {
      setChangingRoleId(null)
    }
  }

  const columns: ColumnsType<User> = [
    {
      title: t('col.user'), key: 'user', width: 240,
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
    { title: t('col.email'), dataIndex: 'email', key: 'email', ellipsis: true, render: (v: string | null) => <Text type='secondary'>{v ?? '—'}</Text> },
    { title: t('col.phone'), dataIndex: 'phoneNumber', key: 'phone', width: 130, render: (v: string | null) => v ?? '—' },
    {
      title: t('col.role'), dataIndex: 'role', key: 'role', width: 160,
      render: (v: string, r: User) => (
        <Select
          size='small'
          variant='borderless'
          value={v}
          loading={changingRoleId === r.id}
          disabled={changingRoleId !== null && changingRoleId !== r.id}
          style={{ width: '100%' }}
          onChange={(next) => handleChangeRole(r, next)}
          options={['ADMIN', 'SALES', 'STOCK'].map((k) => ({
            value: k,
            disabled: k === 'ADMIN',
            label: <Tag color={ROLE_COLORS[k]} style={{ marginInlineEnd: 0 }}>{t(`common:status.role.${k}`, { defaultValue: k })}</Tag>,
          }))}
        />
      ),
    },
    {
      title: t('col.status'), key: 'status', width: 120,
      render: (_, r: User) => (
        <Switch
          size='small'
          loading={togglingId === r.id}
          disabled={togglingId !== null && togglingId !== r.id}
          checked={r.status === 'ACTIVE'}
          checkedChildren={t('common:common.active')}
          unCheckedChildren={t('common:common.locked')}
          onChange={() => handleToggleStatus(r)}
        />
      ),
    },
    {
      title: t('col.resetPwd'), key: 'resetPwd', width: 100,
      render: (_, r: User) => !r.isPasswordReset
        ? <Tag color='orange'>{t('statusBadge.reset')}</Tag>
        : <Tag>{t('statusBadge.notReset')}</Tag>,
    },
    {
      title: t('col.createdAt'), dataIndex: 'createdAt', key: 'created', width: 120,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{date(v)}</Text>,
    },
    {
      title: t('col.actions'), key: 'action', width: 90,
      render: (_, record) => (
        <Space size={2}>
          <Tooltip title={t('tooltip.edit')}>
            <Button type='text' size='small' icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title={t('tooltip.resetPassword')}>
            <Button type='text' size='small' icon={<LockOutlined style={{ color: '#faad14' }} />}
              onClick={() => { setResetTarget(record); setTempPassword(null) }} />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title={t('title')}
        extra={<Button type='primary' icon={<PlusOutlined />} onClick={openCreate}>{t('addButton')}</Button>}
      />

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input.Search placeholder={t('filter.search')} style={{ width: 240 }}
            value={search} onChange={(e) => setSearch(e.target.value)} allowClear />
          <Select placeholder={t('filter.role')} style={{ width: 150 }} allowClear value={filterRole} onChange={setFilterRole}
            options={['ADMIN', 'SALES', 'STOCK'].map((k) => ({ value: k, label: t(`common:status.role.${k}`, { defaultValue: k }) }))}
          />
        </div>

        <Table rowKey='id' loading={isLoading} columns={columns} dataSource={filtered}
          size='middle' bordered
          pagination={{
            current: page, total, pageSize: 10,
            onChange: setPage,
            showTotal: (total) => t('totalSuffix', { count: total }),
          }}
        />
      </Card>

      <Modal title={t('create.title')} open={createOpen}
        onCancel={() => { setCreateOpen(false); createForm.resetFields() }} width={480}
        footer={[
          <Button key='c' onClick={() => setCreateOpen(false)}>{t('common:button.cancel')}</Button>,
          <Button key='s' type='primary' loading={creating} onClick={handleCreate}>{t('create.submit')}</Button>,
        ]}>
        <Form form={createForm} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label={t('create.fullName')} name='fullName' rules={[{ required: true, message: t('create.fullNameRequired') }]}>
            <Input autoFocus placeholder={t('create.fullNamePlaceholder')} />
          </Form.Item>
          <Form.Item label={t('create.email')} name='email' rules={[{ type: 'email', message: t('create.emailInvalid') }]}>
            <Input placeholder={t('create.emailPlaceholder')} />
          </Form.Item>
          <Form.Item label={t('create.role')} name='roleName' rules={[{ required: true, message: t('create.roleRequired') }]}>
            <Select options={ASSIGNABLE_ROLES.map((v) => ({ value: v, label: t(`common:status.role.${v}`, { defaultValue: v }) }))} />
          </Form.Item>
          <Text type='secondary' style={{ fontSize: 12 }}>{t('create.hint')}</Text>
        </Form>
      </Modal>

      <Modal title={t('edit.title')} open={editOpen}
        onCancel={() => { setEditOpen(false); setEditItem(null); editForm.resetFields() }} width={480}
        footer={[
          <Button key='c' onClick={() => setEditOpen(false)}>{t('common:button.cancel')}</Button>,
          <Button key='s' type='primary' loading={updating} onClick={handleEdit}>{t('edit.submit')}</Button>,
        ]}>
        <Form form={editForm} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label={t('edit.fullName')} name='fullName'><Input autoFocus /></Form.Item>
          <Form.Item label={t('edit.phone')} name='phoneNumber'><Input placeholder={t('edit.phonePlaceholder')} /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<Space><LockOutlined style={{ color: '#faad14' }} /><span>{t('reset.title')}</span></Space>}
        open={!!resetTarget} onCancel={() => { setResetTarget(null); setTempPassword(null) }}
        footer={tempPassword ? [
          <Button key='close' type='primary' onClick={() => { setResetTarget(null); setTempPassword(null) }}>{t('common:button.close')}</Button>,
        ] : [
          <Button key='c' onClick={() => { setResetTarget(null); setTempPassword(null) }}>{t('common:button.cancel')}</Button>,
          <Button key='r' danger loading={resetting} onClick={handleResetPassword}>{t('reset.submit')}</Button>,
        ]}
        width={440}
      >
        {tempPassword ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <Text>
              <Trans i18nKey='reset.tempIntro' ns='employee' values={{ username: resetTarget?.username ?? '' }} components={[<strong key='0' />]} />
            </Text>
            <div style={{ fontSize: 24, fontWeight: 700, color: PRIMARY, margin: '12px 0', letterSpacing: 2 }}>{tempPassword}</div>
            <Text type='secondary'>{t('reset.tempNote')}</Text>
          </div>
        ) : (
          <Text>
            <Trans i18nKey='reset.confirm' ns='employee' values={{ username: resetTarget?.username ?? '' }} components={[<strong key='0' />]} />
          </Text>
        )}
      </Modal>
    </div>
  )
}

export default NhanVienPage
