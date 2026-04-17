import { useState } from 'react'
import { Breadcrumb, Button, Card, Form, Input, message, Modal, Space, Table, Tag, Tooltip, Typography } from 'antd'
import { HomeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Text } = Typography
const PRIMARY = '#E8603C'

interface DanhMuc {
  id: string
  ma: string
  ten: string
  moTa: string
  soLuongSP: number
  trangThai: 'hoat_dong' | 'khong_hoat_dong'
  ngayTao: string
}

interface FormValues { ten: string; moTa?: string }

const INIT: DanhMuc[] = [
  { id: '1', ma: 'DM-001', ten: 'Điện tử',          moTa: 'Thiết bị điện tử, linh kiện máy tính',       soLuongSP: 6, trangThai: 'hoat_dong',       ngayTao: '2024-01-05' },
  { id: '2', ma: 'DM-002', ten: 'Cơ khí',            moTa: 'Máy móc cơ khí, động cơ, máy bơm',           soLuongSP: 4, trangThai: 'hoat_dong',       ngayTao: '2024-01-06' },
  { id: '3', ma: 'DM-003', ten: 'Văn phòng phẩm',    moTa: 'Văn phòng phẩm, đồ dùng văn phòng',          soLuongSP: 5, trangThai: 'hoat_dong',       ngayTao: '2024-01-07' },
  { id: '4', ma: 'DM-004', ten: 'Thiết bị y tế',     moTa: 'Dụng cụ y tế, thiết bị chẩn đoán',           soLuongSP: 4, trangThai: 'hoat_dong',       ngayTao: '2024-01-08' },
  { id: '5', ma: 'DM-005', ten: 'Dụng cụ',           moTa: 'Dụng cụ cầm tay, dụng cụ đo lường',          soLuongSP: 7, trangThai: 'hoat_dong',       ngayTao: '2024-01-09' },
  { id: '6', ma: 'DM-006', ten: 'Vật tư xây dựng',   moTa: 'Xi măng, sắt thép, vật liệu xây dựng',       soLuongSP: 0, trangThai: 'khong_hoat_dong', ngayTao: '2024-01-10' },
  { id: '7', ma: 'DM-007', ten: 'Hóa chất',          moTa: 'Hóa chất công nghiệp, dung môi',             soLuongSP: 0, trangThai: 'khong_hoat_dong', ngayTao: '2024-01-11' },
]

const genMA = () => `DM-${String(INIT.length + Math.floor(Math.random() * 100)).padStart(3, '0')}`

const DanhMucVatTuPage = () => {
  const [data, setData] = useState<DanhMuc[]>(INIT)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<DanhMuc | null>(null)
  const [deleteItem, setDeleteItem] = useState<DanhMuc | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [form] = Form.useForm<FormValues>()

  const run = (cb: () => void) => { setLoading(true); setTimeout(() => { cb(); setLoading(false) }, 500) }

  const openAdd = () => {
    setEditItem(null); form.resetFields(); setModalOpen(true)
  }

  const openEdit = (r: DanhMuc) => {
    setEditItem(r); form.setFieldsValue({ ten: r.ten, moTa: r.moTa }); setModalOpen(true)
  }

  const handleSave = () => {
    form.validateFields().then(v => {
      run(() => {
        if (editItem) {
          setData(p => p.map(d => d.id === editItem.id ? { ...d, ...v } : d))
          message.success('Cập nhật danh mục thành công!')
        } else {
          setData(p => [...p, { id: String(Date.now()), ma: genMA(), ten: v.ten, moTa: v.moTa ?? '', soLuongSP: 0, trangThai: 'hoat_dong', ngayTao: new Date().toISOString().slice(0, 10) }])
          message.success('Thêm danh mục thành công!')
        }
        setModalOpen(false)
      })
    })
  }

  const handleDelete = () => {
    if (!deleteItem) return
    run(() => {
      setData(p => p.filter(d => d.id !== deleteItem.id))
      message.success(`Đã xoá danh mục "${deleteItem.ten}"`)
      setDeleteOpen(false)
    })
  }

  const toggleStatus = (r: DanhMuc) => {
    setData(p => p.map(d => d.id === r.id ? { ...d, trangThai: d.trangThai === 'hoat_dong' ? 'khong_hoat_dong' : 'hoat_dong' } : d))
    message.success('Đã cập nhật trạng thái!')
  }

  const columns: ColumnsType<DanhMuc> = [
    { title: 'STT', key: 'stt', width: 55, render: (_, __, i) => <Text type='secondary'>{i + 1}</Text> },
    { title: 'Mã DM', dataIndex: 'ma', key: 'ma', width: 90 },
    {
      title: 'Danh mục', dataIndex: 'ten', key: 'ten',
      render: (v, r) => (
        <Space>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `${PRIMARY}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY }}>
            <AppstoreOutlined />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{v}</div>
            <Text type='secondary' style={{ fontSize: 12 }}>{r.moTa}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Số sản phẩm', dataIndex: 'soLuongSP', key: 'soLuongSP', width: 120, align: 'center',
      render: v => <Tag color={v > 0 ? 'blue' : 'default'}>{v} sản phẩm</Tag>
    },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', width: 140,
      render: (v, r) => (
        <Tag color={v === 'hoat_dong' ? 'green' : 'red'} style={{ cursor: 'pointer' }} onClick={() => toggleStatus(r)}>
          {v === 'hoat_dong' ? 'Hoạt động' : 'Ngừng hoạt động'}
        </Tag>
      )
    },
    { title: 'Ngày tạo', dataIndex: 'ngayTao', key: 'ngayTao', width: 110 },
    {
      title: 'Hành động', key: 'action', width: 100,
      render: (_, r) => (
        <Space size={2}>
          <Tooltip title='Chỉnh sửa'><Button type='text' size='small' icon={<EditOutlined style={{ color: '#1677ff' }} />} onClick={() => openEdit(r)} /></Tooltip>
          <Tooltip title='Xoá'><Button type='text' size='small' danger icon={<DeleteOutlined />} onClick={() => { setDeleteItem(r); setDeleteOpen(true) }} /></Tooltip>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Breadcrumb className='mb-4' items={[{ title: <HomeOutlined />, href: '/' }, { title: 'Danh mục vật tư' }]} />
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>Danh mục vật tư</Typography.Title>
          <Button type='primary' icon={<PlusOutlined />} onClick={openAdd}>Thêm danh mục</Button>
        </div>
        <Table rowKey='id' loading={loading} columns={columns} dataSource={data} bordered size='middle'
          pagination={{ pageSize: 10, showTotal: t => `Tổng ${t} danh mục` }} />
      </Card>

      <Modal title={editItem ? 'Sửa danh mục' : 'Thêm danh mục'} open={modalOpen} onCancel={() => setModalOpen(false)}
        footer={[<Button key='c' onClick={() => setModalOpen(false)}>Huỷ</Button>, <Button key='s' type='primary' loading={loading} onClick={handleSave}>Lưu</Button>]}>
        <Form form={form} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label='Tên danh mục' name='ten' rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}>
            <Input placeholder='Ví dụ: Điện tử, Cơ khí...' />
          </Form.Item>
          <Form.Item label='Mô tả' name='moTa'>
            <Input.TextArea rows={3} placeholder='Mô tả danh mục...' />
          </Form.Item>
        </Form>
      </Modal>

      <Modal open={deleteOpen} onCancel={() => setDeleteOpen(false)} title='Xác nhận xoá'
        footer={[<Button key='c' onClick={() => setDeleteOpen(false)}>Huỷ</Button>, <Button key='d' danger type='primary' loading={loading} onClick={handleDelete}>Xoá</Button>]}>
        <Text>Bạn có chắc muốn xoá danh mục <Text strong style={{ color: '#ff4d4f' }}>"{deleteItem?.ten}"</Text>?</Text>
        {deleteItem && deleteItem.soLuongSP > 0 && (
          <div style={{ marginTop: 8, color: '#faad14' }}>⚠ Danh mục này đang có {deleteItem.soLuongSP} sản phẩm.</div>
        )}
      </Modal>
    </div>
  )
}

export default DanhMucVatTuPage
