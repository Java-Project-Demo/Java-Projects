import { useState, useMemo } from 'react'
import {
  App, Button, Card, Col, Form, Input, Modal, Row,
  Space, Statistic, Table, Tag, Tooltip, Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, EditOutlined, ShopOutlined } from '@ant-design/icons'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
} from '@/features/supplier/supplierApi'
import type { Supplier, SupplierRequest } from '@/types/api'
import { useAppSelector } from '@/app/hooks'

const { Text } = Typography
const PRIMARY = '#E8603C'

const NhaCungCapPage = () => {
  const { message } = App.useApp()
  const user = useAppSelector((s) => s.auth.user)
  const isAdmin = user?.role === 'ADMIN'

  const [search, setSearch] = useState('')
  const [editItem, setEditItem] = useState<Supplier | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<SupplierRequest>()

  const { data: suppliers = [], isLoading } = useGetSuppliersQuery()
  const [createSupplier, { isLoading: creating }] = useCreateSupplierMutation()
  const [updateSupplier, { isLoading: updating }] = useUpdateSupplierMutation()

  const filtered = useMemo(
    () => suppliers.filter((s) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        s.name.toLowerCase().includes(q) ||
        (s.phoneNumber ?? '').toLowerCase().includes(q) ||
        (s.taxCode ?? '').toLowerCase().includes(q)
      )
    }),
    [suppliers, search],
  )

  const openAdd = () => { setEditItem(null); form.resetFields(); setModalOpen(true) }
  const openEdit = (r: Supplier) => {
    setEditItem(r)
    form.setFieldsValue({
      name: r.name, contactPerson: r.contactPerson ?? '',
      phoneNumber: r.phoneNumber ?? '', email: r.email ?? '',
      address: r.address ?? '', taxCode: r.taxCode ?? '',
    })
    setModalOpen(true)
  }

  const handleSave = () => {
    form.validateFields().then(async (values) => {
      try {
        if (editItem) {
          await updateSupplier({ id: editItem.id, data: values }).unwrap()
          void message.success('Cập nhật nhà cung cấp thành công!')
        } else {
          await createSupplier(values).unwrap()
          void message.success('Thêm nhà cung cấp thành công!')
        }
        setModalOpen(false)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? 'Lỗi hệ thống')
      }
    })
  }

  const columns: ColumnsType<Supplier> = [
    { title: 'STT', key: 'stt', width: 55, render: (_, __, i) => <Text type='secondary'>{i + 1}</Text> },
    {
      title: 'Tên nhà cung cấp', dataIndex: 'name', key: 'name',
      render: (v: string) => (
        <Space>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${PRIMARY}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShopOutlined style={{ color: PRIMARY }} />
          </div>
          <Text strong>{v}</Text>
        </Space>
      ),
    },
    { title: 'Người liên hệ', dataIndex: 'contactPerson', key: 'contact', width: 150, render: (v: string | null) => v ?? '—' },
    { title: 'SĐT', dataIndex: 'phoneNumber', key: 'phone', width: 130, render: (v: string | null) => v ?? '—' },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true, render: (v: string | null) => <Text type='secondary'>{v ?? '—'}</Text> },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address', ellipsis: true, render: (v: string | null) => <Text type='secondary'>{v ?? '—'}</Text> },
    {
      title: 'Mã số thuế', dataIndex: 'taxCode', key: 'tax', width: 130,
      render: (v: string | null) => v ? <Tag>{v}</Tag> : <Text type='secondary'>—</Text>,
    },
    {
      title: 'Ngày tạo', dataIndex: 'createdAt', key: 'created', width: 120,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v ? new Date(v).toLocaleDateString('vi-VN') : '—'}</Text>,
    },
    {
      title: 'Hành động', key: 'action', width: 90,
      render: (_, record) => isAdmin ? (
        <Tooltip title='Chỉnh sửa'>
          <Button type='text' size='small' icon={<EditOutlined style={{ color: '#1677ff' }} />}
            onClick={() => openEdit(record)} />
        </Tooltip>
      ) : null,
    },
  ]

  return (
    <div>
      <PageHeader
        title='Nhà cung cấp'
        subtitle='Quản lý danh sách nhà cung cấp vật tư'
        extra={isAdmin ? (
          <Button type='primary' icon={<PlusOutlined />} onClick={openAdd}>Thêm nhà cung cấp</Button>
        ) : undefined}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <Statistic title='Tổng nhà cung cấp' value={suppliers.length}
              suffix='NCC' valueStyle={{ color: PRIMARY, fontWeight: 700 }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ marginBottom: 16 }}>
          <Input.Search placeholder='Tìm tên, SĐT, mã số thuế...' style={{ width: 300 }}
            value={search} onChange={(e) => setSearch(e.target.value)} allowClear />
        </div>
        <Table
          rowKey='id' loading={isLoading} columns={columns} dataSource={filtered}
          size='middle' bordered scroll={{ x: 1000 }}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} nhà cung cấp` }}
          locale={{ emptyText: <EmptyState title='Chưa có nhà cung cấp' action={isAdmin ? { label: 'Thêm nhà cung cấp', onClick: openAdd } : undefined} /> }}
        />
      </Card>

      <Modal
        title={editItem ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
        open={modalOpen} onCancel={() => setModalOpen(false)} width={600}
        footer={[
          <Button key='c' onClick={() => setModalOpen(false)}>Huỷ</Button>,
          <Button key='s' type='primary' loading={creating || updating} onClick={handleSave}>
            {editItem ? 'Cập nhật' : 'Thêm mới'}
          </Button>,
        ]}
      >
        <Form form={form} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label='Tên nhà cung cấp' name='name' rules={[{ required: true, message: 'Nhập tên nhà cung cấp' }]}>
            <Input autoFocus placeholder='Công ty TNHH ABC' />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label='Người liên hệ' name='contactPerson'>
                <Input placeholder='Nguyễn Văn A' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='Số điện thoại' name='phoneNumber'>
                <Input placeholder='09xxxxxxxx' />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label='Email' name='email'>
                <Input placeholder='contact@company.com' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='Mã số thuế' name='taxCode'>
                <Input placeholder='0123456789' />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label='Địa chỉ' name='address'>
            <Input.TextArea rows={2} placeholder='Địa chỉ công ty...' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default NhaCungCapPage
