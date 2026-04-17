import { useState } from 'react'
import { Breadcrumb, Button, DatePicker, Descriptions, Drawer, Form, Input, InputNumber, message, Modal, Select, Space, Table, Tag, Typography } from 'antd'
import { HomeOutlined, PlusOutlined, ExportOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Text, Title } = Typography

type TrangThai = 'cho_xuat' | 'da_xuat' | 'da_huy'

interface XuatKhoRecord {
  id: string; maXuatHang: string; tenVatTu: string; khachHang: string
  trangThai: TrangThai; thoiGianXuat: string; soLuong: number; tongTien: number
}

interface FormValues {
  tenVatTu: string; khachHang: string; soLuong: number; donGia: number; ghiChu?: string
}

const TRANG_THAI: Record<TrangThai, { label: string; color: string }> = {
  cho_xuat: { label: 'Chờ xuất', color: 'gold' },
  da_xuat:  { label: 'Đã xuất',  color: 'blue' },
  da_huy:   { label: 'Đã huỷ',   color: 'red' }
}

const VAT_TU_OPTIONS = ['Máy khoan Bosch GSB 550', 'Laptop Dell XPS 15', 'Bút bi Thiên Long', 'Giấy A4 Double A', 'Máy hàn Riland ARC-200', 'Thước kẹp Mitutoyo']

const INIT: XuatKhoRecord[] = [
  { id: '1',  maXuatHang: 'XK-00001', tenVatTu: 'Máy khoan điện Bosch',    khachHang: 'Công ty TNHH ABC',       trangThai: 'da_xuat',  thoiGianXuat: '2024-03-20 09:00', soLuong: 5,  tongTien: 9000000  },
  { id: '2',  maXuatHang: 'XK-00002', tenVatTu: 'Bút bi Thiên Long',        khachHang: 'Trường THPT Nguyễn Trãi', trangThai: 'da_xuat', thoiGianXuat: '2024-03-19 14:30', soLuong: 50, tongTien: 1250000  },
  { id: '3',  maXuatHang: 'XK-00003', tenVatTu: 'Giấy A4 Double A',         khachHang: 'Văn phòng Quận 1',       trangThai: 'cho_xuat', thoiGianXuat: '2024-03-19 08:00', soLuong: 10, tongTien: 1200000  },
  { id: '4',  maXuatHang: 'XK-00004', tenVatTu: 'Thước kẹp Mitutoyo',       khachHang: 'Xưởng cơ khí Đông Nam',  trangThai: 'da_xuat', thoiGianXuat: '2024-03-18 11:00', soLuong: 3,  tongTien: 1650000  },
  { id: '5',  maXuatHang: 'XK-00005', tenVatTu: 'Máy hàn Riland ARC-200',   khachHang: 'Công ty Xây dựng Phú Mỹ', trangThai: 'da_huy', thoiGianXuat: '2024-03-17 15:00', soLuong: 2,  tongTien: 7800000  },
  { id: '6',  maXuatHang: 'XK-00006', tenVatTu: 'Laptop Dell XPS 15',        khachHang: 'Ngân hàng Vietcombank',   trangThai: 'cho_xuat', thoiGianXuat: '2024-03-17 09:30', soLuong: 3, tongTien: 84000000 },
  { id: '7',  maXuatHang: 'XK-00007', tenVatTu: 'Dao mổ y tế hộp 100 cái',  khachHang: 'Bệnh viện Chợ Rẫy',      trangThai: 'da_xuat', thoiGianXuat: '2024-03-16 10:00', soLuong: 20, tongTien: 5600000  },
  { id: '8',  maXuatHang: 'XK-00008', tenVatTu: 'Bình xịt cồn sát khuẩn',   khachHang: 'Trạm Y tế Phường 5',     trangThai: 'da_xuat', thoiGianXuat: '2024-03-15 08:45', soLuong: 30, tongTien: 1650000  },
]

const fmtCurrency = (v: number) => v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
const genMA = () => `XK-${String(Date.now()).slice(-5)}`

const XuatKhoPage = () => {
  const [data, setData] = useState<XuatKhoRecord[]>(INIT)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterTT, setFilterTT] = useState<TrangThai | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<XuatKhoRecord | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [actionTarget, setActionTarget] = useState<XuatKhoRecord | null>(null)
  const [form] = Form.useForm<FormValues>()

  const run = (cb: () => void) => { setLoading(true); setTimeout(() => { cb(); setLoading(false) }, 500) }

  const filtered = data.filter(r => {
    const ms = !search || r.maXuatHang.toLowerCase().includes(search.toLowerCase()) || r.tenVatTu.toLowerCase().includes(search.toLowerCase())
    return ms && (!filterTT || r.trangThai === filterTT)
  })

  const handleXuat = () => {
    if (!actionTarget) return
    run(() => {
      setData(p => p.map(r => r.id === actionTarget.id ? { ...r, trangThai: 'da_xuat' } : r))
      message.success('Xuất kho thành công!')
      setConfirmOpen(false)
    })
  }

  const handleHuy = () => {
    if (!actionTarget) return
    run(() => {
      setData(p => p.map(r => r.id === actionTarget.id ? { ...r, trangThai: 'da_huy' } : r))
      message.success('Đã huỷ phiếu xuất!')
      setCancelOpen(false)
    })
  }

  const handleTao = () => {
    form.validateFields().then(v => {
      run(() => {
        setData(p => [{
          id: String(Date.now()), maXuatHang: genMA(), tenVatTu: v.tenVatTu,
          khachHang: v.khachHang, trangThai: 'cho_xuat',
          thoiGianXuat: new Date().toLocaleString('vi-VN'),
          soLuong: v.soLuong, tongTien: v.soLuong * v.donGia
        }, ...p])
        message.success('Tạo phiếu xuất kho thành công!')
        setModalOpen(false)
        form.resetFields()
      })
    })
  }

  const columns: ColumnsType<XuatKhoRecord> = [
    { title: 'STT', key: 'stt', width: 55, render: (_, __, i) => <Text type='secondary'>{i + 1}</Text> },
    { title: 'Mã xuất hàng', dataIndex: 'maXuatHang', key: 'ma', width: 120 },
    { title: 'Tên vật tư', dataIndex: 'tenVatTu', key: 'ten', ellipsis: true },
    { title: 'Khách hàng', dataIndex: 'khachHang', key: 'kh', ellipsis: true },
    { title: 'Số lượng', dataIndex: 'soLuong', key: 'sl', width: 90, align: 'center' },
    { title: 'Tổng tiền', dataIndex: 'tongTien', key: 'tt', width: 140, render: fmtCurrency },
    { title: 'Trạng thái', dataIndex: 'trangThai', key: 'tg', width: 120,
      render: (v: TrangThai) => <Tag color={TRANG_THAI[v].color}>{TRANG_THAI[v].label}</Tag> },
    { title: 'Thời gian', dataIndex: 'thoiGianXuat', key: 'tg2', width: 155 },
    {
      title: 'Hành động', key: 'act', width: 230,
      render: (_, r) => (
        <Space size={4} split={<Text type='secondary'>|</Text>}>
          {r.trangThai === 'cho_xuat' && <Button type='link' size='small' icon={<ExportOutlined />} onClick={() => { setActionTarget(r); setConfirmOpen(true) }}>Xuất kho</Button>}
          <Button type='link' size='small' onClick={() => { setSelected(r); setDrawerOpen(true) }}>Chi tiết</Button>
          {r.trangThai === 'cho_xuat' && <Button type='link' size='small' danger onClick={() => { setActionTarget(r); setCancelOpen(true) }}>Huỷ bỏ</Button>}
          {r.trangThai === 'da_huy' && <Button type='link' size='small' onClick={() => setData(p => p.map(d => d.id === r.id ? { ...d, trangThai: 'cho_xuat' } : d))}>Hoạt lại</Button>}
        </Space>
      )
    }
  ]

  return (
    <div>
      <Breadcrumb className='mb-4' items={[{ title: <HomeOutlined />, href: '/' }, { title: 'Xuất kho vật tư' }]} />
      <div className='bg-white rounded-lg p-6 shadow-sm'>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>Xuất kho vật tư</Title>
          <Button type='primary' icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true) }}>Tạo phiếu xuất</Button>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input.Search placeholder='Tìm mã xuất, tên vật tư...' style={{ width: 260 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
          <Select placeholder='Trạng thái' style={{ width: 160 }} allowClear value={filterTT} onChange={setFilterTT}
            options={[{ value: 'cho_xuat', label: 'Chờ xuất' }, { value: 'da_xuat', label: 'Đã xuất' }, { value: 'da_huy', label: 'Đã huỷ' }]} />
          <DatePicker placeholder='Ngày xuất hàng' />
        </div>
        <Table rowKey='id' loading={loading} columns={columns} dataSource={filtered} bordered size='middle'
          pagination={{ pageSize: 10, showTotal: t => `Tổng ${t} phiếu` }} />
      </div>

      <Drawer title='Chi tiết phiếu xuất kho' width={560} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {selected && (
          <Descriptions bordered column={2} size='small'>
            <Descriptions.Item label='Mã xuất hàng'>{selected.maXuatHang}</Descriptions.Item>
            <Descriptions.Item label='Trạng thái'><Tag color={TRANG_THAI[selected.trangThai].color}>{TRANG_THAI[selected.trangThai].label}</Tag></Descriptions.Item>
            <Descriptions.Item label='Tên vật tư' span={2}>{selected.tenVatTu}</Descriptions.Item>
            <Descriptions.Item label='Khách hàng' span={2}>{selected.khachHang}</Descriptions.Item>
            <Descriptions.Item label='Số lượng'>{selected.soLuong}</Descriptions.Item>
            <Descriptions.Item label='Tổng tiền'><Text strong style={{ color: '#1677ff' }}>{fmtCurrency(selected.tongTien)}</Text></Descriptions.Item>
            <Descriptions.Item label='Thời gian xuất' span={2}>{selected.thoiGianXuat}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      <Modal title='Tạo phiếu xuất kho' open={modalOpen} onCancel={() => setModalOpen(false)}
        footer={[<Button key='c' onClick={() => setModalOpen(false)}>Huỷ</Button>, <Button key='s' type='primary' loading={loading} onClick={handleTao}>Tạo phiếu</Button>]}>
        <Form form={form} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label='Vật tư' name='tenVatTu' rules={[{ required: true, message: 'Chọn vật tư' }]}>
            <Select placeholder='Chọn vật tư' options={VAT_TU_OPTIONS.map(v => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item label='Khách hàng / Đơn vị nhận' name='khachHang' rules={[{ required: true, message: 'Nhập tên khách hàng' }]}>
            <Input placeholder='Tên công ty, đơn vị...' />
          </Form.Item>
          <Space style={{ width: '100%' }} styles={{ item: { flex: 1 } }}>
            <Form.Item label='Số lượng' name='soLuong' rules={[{ required: true, message: 'Nhập số lượng' }]}>
              <InputNumber min={1} style={{ width: '100%' }} placeholder='0' />
            </Form.Item>
            <Form.Item label='Đơn giá (₫)' name='donGia' rules={[{ required: true, message: 'Nhập đơn giá' }]}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder='0' formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} />
            </Form.Item>
          </Space>
          <Form.Item label='Ghi chú' name='ghiChu'>
            <Input.TextArea rows={2} placeholder='Ghi chú thêm...' />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title='Xác nhận xuất kho' open={confirmOpen} onCancel={() => setConfirmOpen(false)}
        footer={[<Button key='c' onClick={() => setConfirmOpen(false)}>Huỷ</Button>, <Button key='x' type='primary' loading={loading} onClick={handleXuat} icon={<ExportOutlined />}>Xuất kho</Button>]}>
        <Text>Bạn có chắc muốn xuất kho phiếu <Text strong>"{actionTarget?.maXuatHang}"</Text>?</Text>
      </Modal>

      <Modal title='Xác nhận huỷ' open={cancelOpen} onCancel={() => setCancelOpen(false)}
        footer={[<Button key='c' onClick={() => setCancelOpen(false)}>Đóng</Button>, <Button key='h' danger type='primary' loading={loading} onClick={handleHuy}>Huỷ phiếu</Button>]}>
        <Text>Bạn có chắc muốn huỷ phiếu xuất kho <Text strong style={{ color: '#ff4d4f' }}>"{actionTarget?.maXuatHang}"</Text>?</Text>
      </Modal>
    </div>
  )
}

export default XuatKhoPage
