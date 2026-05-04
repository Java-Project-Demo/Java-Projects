import { useState, useMemo } from 'react'
import {
  App, Button, Card, Col, Form, Input, Modal, Row, Select,
  Space, Statistic, Table, Tag, Tooltip, Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, EditOutlined, SafetyCertificateOutlined, DeleteOutlined } from '@ant-design/icons'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import {
  useGetWarrantiesQuery,
  useCreateWarrantyMutation,
  useUpdateWarrantyMutation,
} from '@/features/warranty/warrantyApi'
import type { WarrantyResponse, WarrantyStatus, UpdateWarrantyRequest } from '@/types/api'
import { useAppSelector } from '@/app/hooks'

const { Text } = Typography
const PRIMARY = '#E8603C'

const STATUS_CONFIG: Record<WarrantyStatus, { label: string; color: string }> = {
  RECEIVED:   { label: 'Đã tiếp nhận', color: 'blue' },
  FIXING:     { label: 'Đang sửa',     color: 'orange' },
  FIXED:      { label: 'Đã sửa xong', color: 'green' },
  RETURNED:   { label: 'Đã trả',       color: 'default' },
  UNFIXABLE:  { label: 'Không sửa được', color: 'red' },
}

const BaoHanhPage = () => {
  const { message } = App.useApp()
  const user = useAppSelector((s) => s.auth.user)
  const canUpdate = user?.role === 'ADMIN' || user?.role === 'STOCK'

  const [filterStatus, setFilterStatus] = useState<WarrantyStatus | undefined>()
  const [createOpen, setCreateOpen] = useState(false)
  const [updateTarget, setUpdateTarget] = useState<WarrantyResponse | null>(null)
  const [imeiInput, setImeiInput] = useState('')
  const [imeiList, setImeiList] = useState<string[]>([])
  const [createForm] = Form.useForm()
  const [updateForm] = Form.useForm<{ status: WarrantyStatus; technicalNote?: string }>()

  const { data: warranties = [], isLoading } = useGetWarrantiesQuery()
  const [createWarranty, { isLoading: creating }] = useCreateWarrantyMutation()
  const [updateWarranty, { isLoading: updating }] = useUpdateWarrantyMutation()

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

  const handleAddImei = () => {
    const v = imeiInput.trim()
    if (!v) return
    if (imeiList.includes(v)) { void message.warning('IMEI đã được thêm'); return }
    setImeiList((p) => [...p, v])
    setImeiInput('')
  }

  const openCreate = () => { createForm.resetFields(); setImeiList([]); setImeiInput(''); setCreateOpen(true) }

  const handleCreate = () => {
    createForm.validateFields().then(async (values) => {
      if (imeiList.length === 0) { void message.error('Cần nhập ít nhất 1 IMEI'); return }
      try {
        await createWarranty({ imeis: imeiList, issue: values.issue as string }).unwrap()
        void message.success('Tạo phiếu bảo hành thành công!')
        setCreateOpen(false)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? 'Lỗi hệ thống')
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
        void message.success('Cập nhật bảo hành thành công!')
        setUpdateTarget(null)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? 'Lỗi hệ thống')
      }
    })
  }

  const columns: ColumnsType<WarrantyResponse> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 65 },
    { title: 'ProductItem ID', dataIndex: 'productItemId', key: 'itemId', width: 120 },
    {
      title: 'Mô tả sự cố', dataIndex: 'issueDescription', key: 'issue', ellipsis: true,
      render: (v: string) => <Text>{v}</Text>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 150,
      render: (v: WarrantyStatus) => {
        const cfg = STATUS_CONFIG[v] ?? { label: v, color: 'default' }
        return <Tag color={cfg.color}>{cfg.label}</Tag>
      },
    },
    {
      title: 'Ngày nhận', dataIndex: 'receivedDate', key: 'received', width: 130,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v ? new Date(v).toLocaleDateString('vi-VN') : '—'}</Text>,
    },
    {
      title: 'Ngày trả', dataIndex: 'returnDate', key: 'returned', width: 130,
      render: (v: string | null) => <Text style={{ fontSize: 12 }}>{v ? new Date(v).toLocaleDateString('vi-VN') : '—'}</Text>,
    },
    {
      title: 'Ghi chú KT', dataIndex: 'technicalNote', key: 'note', ellipsis: true,
      render: (v: string | undefined) => <Text type='secondary' style={{ fontSize: 12 }}>{v ?? '—'}</Text>,
    },
    {
      title: 'Hành động', key: 'action', width: 90,
      render: (_, record) => canUpdate ? (
        <Tooltip title='Cập nhật trạng thái'>
          <Button type='text' size='small' icon={<EditOutlined style={{ color: '#1677ff' }} />}
            onClick={() => openUpdate(record)} />
        </Tooltip>
      ) : null,
    },
  ]

  return (
    <div>
      <PageHeader
        title='Quản lý bảo hành'
        subtitle='Theo dõi và xử lý các phiếu bảo hành'
        extra={
          <Button type='primary' icon={<PlusOutlined />} onClick={openCreate}>
            Tạo phiếu bảo hành
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Tổng phiếu', value: stats.total, color: PRIMARY },
          { title: 'Đang xử lý', value: stats.active, color: '#faad14' },
          { title: 'Đã sửa xong', value: stats.fixed, color: '#52c41a' },
          { title: 'Không sửa được', value: stats.unfixable, color: '#ff4d4f' },
        ].map((s, i) => (
          <Col xs={12} xl={6} key={i}>
            <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <Statistic title={s.title} value={s.value} valueStyle={{ color: s.color, fontWeight: 700 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
        title={<Space><SafetyCertificateOutlined style={{ color: PRIMARY }} /><span>Danh sách phiếu bảo hành</span></Space>}
        extra={
          <Select placeholder='Lọc trạng thái' allowClear style={{ width: 180 }}
            value={filterStatus} onChange={setFilterStatus}
            options={Object.entries(STATUS_CONFIG).map(([v, { label }]) => ({ value: v, label }))}
          />
        }
      >
        <Table
          rowKey='id' loading={isLoading} columns={columns} dataSource={filtered}
          size='middle' bordered
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} phiếu` }}
          locale={{ emptyText: <EmptyState title='Chưa có phiếu bảo hành nào' description='Tạo phiếu mới khi có thiết bị cần sửa chữa' action={{ label: 'Tạo phiếu', onClick: openCreate }} /> }}
        />
      </Card>

      {/* Create Modal */}
      <Modal title='Tạo phiếu bảo hành' open={createOpen} onCancel={() => setCreateOpen(false)} width={520}
        footer={[
          <Button key='c' onClick={() => setCreateOpen(false)}>Huỷ</Button>,
          <Button key='s' type='primary' loading={creating} onClick={handleCreate}>Tạo phiếu</Button>,
        ]}>
        <Form form={createForm} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label='Danh sách IMEI cần bảo hành'>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Input autoFocus placeholder='Nhập IMEI rồi nhấn Thêm hoặc Enter'
                value={imeiInput} onChange={(e) => setImeiInput(e.target.value)}
                onPressEnter={handleAddImei} style={{ flex: 1 }} />
              <Button icon={<PlusOutlined />} onClick={handleAddImei}>Thêm</Button>
            </div>
            {imeiList.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {imeiList.map((imei) => (
                  <Tag key={imei} closable onClose={() => setImeiList((p) => p.filter((i) => i !== imei))}
                    icon={<DeleteOutlined />} color='blue'>
                    {imei}
                  </Tag>
                ))}
              </div>
            ) : (
              <Text type='secondary' style={{ fontSize: 12 }}>Chưa có IMEI. Nhập và nhấn Thêm.</Text>
            )}
          </Form.Item>
          <Form.Item label='Mô tả sự cố' name='issue' rules={[{ required: true, message: 'Nhập mô tả sự cố' }]}>
            <Input.TextArea rows={3} placeholder='Mô tả chi tiết tình trạng hư hỏng...' />
          </Form.Item>
        </Form>
      </Modal>

      {/* Update Modal */}
      <Modal title='Cập nhật trạng thái bảo hành' open={!!updateTarget} onCancel={() => setUpdateTarget(null)} width={480}
        footer={[
          <Button key='c' onClick={() => setUpdateTarget(null)}>Huỷ</Button>,
          <Button key='s' type='primary' loading={updating} onClick={handleUpdate}>Cập nhật</Button>,
        ]}>
        <Form form={updateForm} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label='Trạng thái mới' name='status' rules={[{ required: true, message: 'Chọn trạng thái' }]}>
            <Select options={Object.entries(STATUS_CONFIG).map(([v, { label }]) => ({ value: v, label }))} />
          </Form.Item>
          <Form.Item label='Ghi chú kỹ thuật' name='technicalNote'>
            <Input.TextArea rows={3} placeholder='Ghi chú về quá trình sửa chữa...' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BaoHanhPage
