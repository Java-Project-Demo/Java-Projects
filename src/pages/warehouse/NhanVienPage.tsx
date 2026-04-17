import { useState } from 'react'
import { Avatar, Breadcrumb, Button, Card, Form, Input, message, Modal, Select, Space, Table, Tag, Tooltip, Typography } from 'antd'
import { HomeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, LockOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Text } = Typography
const PRIMARY = '#E8603C'

type VaiTro = 'ADMIN' | 'STOCK' | 'SALE'
type TrangThai = 'hoat_dong' | 'khoa'

interface NhanVien {
  id: string; hoTen: string; username: string; email: string
  sdt: string; vaiTro: VaiTro; trangThai: TrangThai; ngayTao: string
}

interface FormValues { hoTen: string; username: string; email: string; sdt: string; vaiTro: VaiTro; matKhau?: string }

const VAI_TRO_CONFIG: Record<VaiTro, { label: string; color: string }> = {
  ADMIN: { label: 'Quản trị viên', color: 'red' },
  STOCK: { label: 'Thủ kho',       color: 'blue' },
  SALE:  { label: 'Kinh doanh',    color: 'green' }
}

const INIT: NhanVien[] = [
  { id: '1', hoTen: 'Nguyễn Văn An',    username: 'nvaan',    email: 'nvaan@warehouse.vn',    sdt: '0901234567', vaiTro: 'ADMIN', trangThai: 'hoat_dong', ngayTao: '2024-01-01' },
  { id: '2', hoTen: 'Trần Thị Bích',    username: 'ttbich',   email: 'ttbich@warehouse.vn',   sdt: '0912345678', vaiTro: 'STOCK', trangThai: 'hoat_dong', ngayTao: '2024-01-05' },
  { id: '3', hoTen: 'Lê Văn Cường',     username: 'lvcuong',  email: 'lvcuong@warehouse.vn',  sdt: '0923456789', vaiTro: 'SALE',  trangThai: 'hoat_dong', ngayTao: '2024-01-10' },
  { id: '4', hoTen: 'Phạm Thị Dung',    username: 'ptdung',   email: 'ptdung@warehouse.vn',   sdt: '0934567890', vaiTro: 'STOCK', trangThai: 'hoat_dong', ngayTao: '2024-01-15' },
  { id: '5', hoTen: 'Hoàng Văn Em',     username: 'hvem',     email: 'hvem@warehouse.vn',     sdt: '0945678901', vaiTro: 'SALE',  trangThai: 'hoat_dong', ngayTao: '2024-02-01' },
  { id: '6', hoTen: 'Vũ Thị Phương',    username: 'vtphuong', email: 'vtphuong@warehouse.vn', sdt: '0956789012', vaiTro: 'SALE',  trangThai: 'khoa',      ngayTao: '2024-02-10' },
  { id: '7', hoTen: 'Đặng Văn Giang',   username: 'dvgiang',  email: 'dvgiang@warehouse.vn',  sdt: '0967890123', vaiTro: 'STOCK', trangThai: 'hoat_dong', ngayTao: '2024-02-15' },
  { id: '8', hoTen: 'Bùi Thị Hương',    username: 'bthuong',  email: 'bthuong@warehouse.vn',  sdt: '0978901234', vaiTro: 'SALE',  trangThai: 'hoat_dong', ngayTao: '2024-03-01' },
]

const COLORS = ['#E8603C', '#1677ff', '#52c41a', '#faad14', '#722ed1', '#13c2c2', '#eb2f96', '#fa541c']
const avatarColor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length]

const NhanVienPage = () => {
  const [data, setData] = useState<NhanVien[]>(INIT)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterVT, setFilterVT] = useState<VaiTro | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<NhanVien | null>(null)
  const [deleteItem, setDeleteItem] = useState<NhanVien | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [form] = Form.useForm<FormValues>()

  const run = (cb: () => void) => { setLoading(true); setTimeout(() => { cb(); setLoading(false) }, 500) }

  const filtered = data.filter(d => {
    const ms = !search || d.hoTen.toLowerCase().includes(search.toLowerCase()) || d.email.toLowerCase().includes(search.toLowerCase())
    return ms && (!filterVT || d.vaiTro === filterVT)
  })

  const openAdd = () => { setEditItem(null); form.resetFields(); setModalOpen(true) }
  const openEdit = (r: NhanVien) => { setEditItem(r); form.setFieldsValue({ ...r }); setModalOpen(true) }

  const handleSave = () => {
    form.validateFields().then(v => {
      run(() => {
        if (editItem) {
          setData(p => p.map(d => d.id === editItem.id ? { ...d, ...v } : d))
          message.success('Cập nhật nhân viên thành công!')
        } else {
          setData(p => [...p, { id: String(Date.now()), ...v, trangThai: 'hoat_dong', ngayTao: new Date().toISOString().slice(0, 10) }])
          message.success('Thêm nhân viên thành công!')
        }
        setModalOpen(false)
      })
    })
  }

  const handleDelete = () => {
    if (!deleteItem) return
    run(() => {
      setData(p => p.filter(d => d.id !== deleteItem.id))
      message.success(`Đã xoá nhân viên "${deleteItem.hoTen}"`)
      setDeleteOpen(false)
    })
  }

  const toggleLock = (r: NhanVien) => {
    setData(p => p.map(d => d.id === r.id ? { ...d, trangThai: d.trangThai === 'hoat_dong' ? 'khoa' : 'hoat_dong' } : d))
    message.success(r.trangThai === 'hoat_dong' ? `Đã khoá tài khoản ${r.username}` : `Đã mở khoá tài khoản ${r.username}`)
  }

  const columns: ColumnsType<NhanVien> = [
    { title: 'STT', key: 'stt', width: 55, render: (_, __, i) => <Text type='secondary'>{i + 1}</Text> },
    {
      title: 'Nhân viên', key: 'nv', width: 260,
      render: (_, r) => (
        <Space>
          <Avatar style={{ background: avatarColor(r.hoTen), fontWeight: 700, flexShrink: 0 }}>
            {r.hoTen.split(' ').pop()?.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{r.hoTen}</div>
            <Text type='secondary' style={{ fontSize: 12 }}>@{r.username}</Text>
          </div>
        </Space>
      )
    },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
    { title: 'SĐT', dataIndex: 'sdt', key: 'sdt', width: 120 },
    {
      title: 'Vai trò', dataIndex: 'vaiTro', key: 'vaitro', width: 140,
      render: (v: VaiTro) => <Tag color={VAI_TRO_CONFIG[v].color}>{VAI_TRO_CONFIG[v].label}</Tag>
    },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', key: 'tt', width: 120,
      render: (v: TrangThai) => <Tag color={v === 'hoat_dong' ? 'green' : 'red'}>{v === 'hoat_dong' ? 'Hoạt động' : 'Bị khoá'}</Tag>
    },
    { title: 'Ngày tạo', dataIndex: 'ngayTao', key: 'nt', width: 110 },
    {
      title: 'Hành động', key: 'act', width: 120,
      render: (_, r) => (
        <Space size={2}>
          <Tooltip title='Chỉnh sửa'><Button type='text' size='small' icon={<EditOutlined style={{ color: '#1677ff' }} />} onClick={() => openEdit(r)} /></Tooltip>
          <Tooltip title={r.trangThai === 'hoat_dong' ? 'Khoá tài khoản' : 'Mở khoá'}><Button type='text' size='small' icon={<LockOutlined style={{ color: r.trangThai === 'hoat_dong' ? '#faad14' : '#52c41a' }} />} onClick={() => toggleLock(r)} /></Tooltip>
          <Tooltip title='Xoá'><Button type='text' size='small' danger icon={<DeleteOutlined />} onClick={() => { setDeleteItem(r); setDeleteOpen(true) }} /></Tooltip>
        </Space>
      )
    }
  ]

  const stats = [
    { label: 'Tổng nhân viên', value: data.length, color: PRIMARY },
    { label: 'Quản trị viên', value: data.filter(d => d.vaiTro === 'ADMIN').length, color: '#ff4d4f' },
    { label: 'Thủ kho', value: data.filter(d => d.vaiTro === 'STOCK').length, color: '#1677ff' },
    { label: 'Kinh doanh', value: data.filter(d => d.vaiTro === 'SALE').length, color: '#52c41a' },
  ]

  return (
    <div>
      <Breadcrumb className='mb-4' items={[{ title: <HomeOutlined />, href: '/' }, { title: 'Nhân viên' }]} />

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {stats.map((s, i) => (
          <Card key={i} style={{ borderRadius: 10, flex: 1, minWidth: 120, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <Text type='secondary' style={{ fontSize: 12 }}>{s.label}</Text>
          </Card>
        ))}
      </div>

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input.Search placeholder='Tìm tên, email nhân viên...' style={{ width: 260 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
          <Select placeholder='Vai trò' style={{ width: 160 }} allowClear value={filterVT} onChange={setFilterVT}
            options={[{ value: 'ADMIN', label: 'Quản trị viên' }, { value: 'STOCK', label: 'Thủ kho' }, { value: 'SALE', label: 'Kinh doanh' }]} />
          <div style={{ marginLeft: 'auto' }}>
            <Button type='primary' icon={<PlusOutlined />} onClick={openAdd}>Thêm nhân viên</Button>
          </div>
        </div>
        <Table rowKey='id' loading={loading} columns={columns} dataSource={filtered} bordered size='middle'
          onRow={r => ({ style: r.trangThai === 'khoa' ? { opacity: 0.6 } : {} })}
          pagination={{ pageSize: 10, showTotal: t => `Tổng ${t} nhân viên` }} />
      </Card>

      <Modal title={editItem ? 'Sửa nhân viên' : 'Thêm nhân viên'} open={modalOpen} onCancel={() => setModalOpen(false)} width={520}
        footer={[<Button key='c' onClick={() => setModalOpen(false)}>Huỷ</Button>, <Button key='s' type='primary' loading={loading} onClick={handleSave}>Lưu</Button>]}>
        <Form form={form} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label='Họ và tên' name='hoTen' rules={[{ required: true, message: 'Nhập họ tên' }]}>
            <Input prefix={<UserOutlined />} placeholder='Nguyễn Văn A' />
          </Form.Item>
          <Space style={{ width: '100%' }} styles={{ item: { flex: 1 } }}>
            <Form.Item label='Username' name='username' rules={[{ required: true, message: 'Nhập username' }]}>
              <Input placeholder='nvana' />
            </Form.Item>
            <Form.Item label='Vai trò' name='vaiTro' rules={[{ required: true, message: 'Chọn vai trò' }]}>
              <Select options={[{ value: 'ADMIN', label: 'Quản trị viên' }, { value: 'STOCK', label: 'Thủ kho' }, { value: 'SALE', label: 'Kinh doanh' }]} />
            </Form.Item>
          </Space>
          <Form.Item label='Email' name='email' rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
            <Input placeholder='email@warehouse.vn' />
          </Form.Item>
          <Form.Item label='Số điện thoại' name='sdt' rules={[{ required: true, message: 'Nhập số điện thoại' }]}>
            <Input placeholder='09xxxxxxxx' />
          </Form.Item>
          {!editItem && (
            <Form.Item label='Mật khẩu' name='matKhau' rules={[{ required: true, message: 'Nhập mật khẩu' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder='••••••' />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal open={deleteOpen} onCancel={() => setDeleteOpen(false)} title='Xác nhận xoá nhân viên'
        footer={[<Button key='c' onClick={() => setDeleteOpen(false)}>Huỷ</Button>, <Button key='d' danger type='primary' loading={loading} onClick={handleDelete}>Xoá</Button>]}>
        <Text>Bạn có chắc muốn xoá nhân viên <Text strong style={{ color: '#ff4d4f' }}>"{deleteItem?.hoTen}"</Text>?</Text>
      </Modal>
    </div>
  )
}

export default NhanVienPage
