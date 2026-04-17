import { useState } from 'react'
import { Breadcrumb, Button, Card, Descriptions, Drawer, Form, Input, InputNumber, message, Modal, Select, Space, Table, Tag, Timeline, Typography } from 'antd'
import { HomeOutlined, PlusOutlined, CheckOutlined, CloseOutlined, ClockCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Text, Title } = Typography
const PRIMARY = '#E8603C'

type LoaiYC = 'nhap' | 'xuat'
type TrangThaiYC = 'cho_duyet' | 'da_duyet' | 'tu_choi'

interface YeuCau {
  id: string; maYC: string; loai: LoaiYC; nguoiTao: string; tenVatTu: string
  soLuong: number; lyDo: string; trangThai: TrangThaiYC; ngayTao: string; ghiChuDuyet?: string
}

interface FormValues { loai: LoaiYC; tenVatTu: string; soLuong: number; lyDo: string }

const TRANG_THAI: Record<TrangThaiYC, { label: string; color: string }> = {
  cho_duyet: { label: 'Chờ duyệt', color: 'gold' },
  da_duyet:  { label: 'Đã duyệt',  color: 'green' },
  tu_choi:   { label: 'Từ chối',   color: 'red' }
}

const NGUOI_TAO = ['Nguyễn Văn An', 'Trần Thị Bích', 'Lê Văn Cường', 'Phạm Thị Dung', 'Hoàng Văn Em']
const VAT_TU_LIST = ['Máy khoan Bosch GSB 550', 'Laptop Dell XPS 15', 'Bút bi Thiên Long', 'Giấy A4 Double A', 'Máy hàn Riland ARC-200', 'Dao mổ y tế', 'RAM DDR5 Kingston', 'Động cơ điện 3 pha']

const INIT: YeuCau[] = [
  { id: '1', maYC: 'YC-00001', loai: 'nhap', nguoiTao: 'Trần Thị Bích',   tenVatTu: 'RAM DDR5 Kingston Fury',       soLuong: 20, lyDo: 'RAM hết hàng, cần bổ sung gấp cho dự án IT',        trangThai: 'cho_duyet', ngayTao: '2024-03-20 08:30' },
  { id: '2', maYC: 'YC-00002', loai: 'xuat', nguoiTao: 'Lê Văn Cường',    tenVatTu: 'Laptop Dell XPS 15',           soLuong: 3,  lyDo: 'Xuất cho dự án triển khai phần mềm khách hàng',     trangThai: 'da_duyet',  ngayTao: '2024-03-19 14:00', ghiChuDuyet: 'Duyệt. Liên hệ kho lấy hàng.' },
  { id: '3', maYC: 'YC-00003', loai: 'nhap', nguoiTao: 'Phạm Thị Dung',   tenVatTu: 'Giấy A4 Double A',             soLuong: 50, lyDo: 'Giấy in sắp hết, đặt hàng tháng 3',               trangThai: 'da_duyet',  ngayTao: '2024-03-18 09:15', ghiChuDuyet: 'Đồng ý, liên hệ nhà cung cấp.' },
  { id: '4', maYC: 'YC-00004', loai: 'xuat', nguoiTao: 'Hoàng Văn Em',    tenVatTu: 'Máy hàn Riland ARC-200',       soLuong: 2,  lyDo: 'Thuê mượn cho công trình xây dựng Quận 9',         trangThai: 'tu_choi',   ngayTao: '2024-03-17 11:30', ghiChuDuyet: 'Không đủ số lượng trong kho.' },
  { id: '5', maYC: 'YC-00005', loai: 'nhap', nguoiTao: 'Nguyễn Văn An',   tenVatTu: 'Máy đo huyết áp Omron',        soLuong: 10, lyDo: 'Hết hàng, cần nhập thêm cho bệnh viện đối tác',    trangThai: 'cho_duyet', ngayTao: '2024-03-16 10:00' },
  { id: '6', maYC: 'YC-00006', loai: 'xuat', nguoiTao: 'Trần Thị Bích',   tenVatTu: 'Bút bi Thiên Long RT-007',     soLuong: 100, lyDo: 'Xuất cho chương trình tặng quà học sinh',         trangThai: 'da_duyet',  ngayTao: '2024-03-15 15:00', ghiChuDuyet: 'Duyệt.' },
  { id: '7', maYC: 'YC-00007', loai: 'nhap', nguoiTao: 'Lê Văn Cường',    tenVatTu: 'Động cơ điện 3 pha 5.5kW',    soLuong: 5,  lyDo: 'Nhà máy cần gấp cho dây chuyền sản xuất',         trangThai: 'cho_duyet', ngayTao: '2024-03-14 08:00' },
  { id: '8', maYC: 'YC-00008', loai: 'xuat', nguoiTao: 'Phạm Thị Dung',   tenVatTu: 'Dao mổ y tế hộp 100 cái',     soLuong: 5,  lyDo: 'Cấp cho phòng mổ Bệnh viện Đa khoa Trung ương',    trangThai: 'tu_choi',   ngayTao: '2024-03-13 09:30', ghiChuDuyet: 'Cần có xác nhận của giám đốc.' },
]

const genMA = () => `YC-${String(Date.now()).slice(-5)}`

const YeuCauPage = () => {
  const [data, setData] = useState<YeuCau[]>(INIT)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterTT, setFilterTT] = useState<TrangThaiYC | undefined>()
  const [filterLoai, setFilterLoai] = useState<LoaiYC | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<YeuCau | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [duyetOpen, setDuyetOpen] = useState(false)
  const [tuChoiOpen, setTuChoiOpen] = useState(false)
  const [actionTarget, setActionTarget] = useState<YeuCau | null>(null)
  const [ghiChuDuyet, setGhiChuDuyet] = useState('')
  const [form] = Form.useForm<FormValues>()

  const run = (cb: () => void) => { setLoading(true); setTimeout(() => { cb(); setLoading(false) }, 500) }

  const filtered = data.filter(d => {
    const ms = !search || d.maYC.includes(search) || d.tenVatTu.toLowerCase().includes(search.toLowerCase()) || d.nguoiTao.toLowerCase().includes(search.toLowerCase())
    return ms && (!filterTT || d.trangThai === filterTT) && (!filterLoai || d.loai === filterLoai)
  })

  const handleDuyet = () => {
    if (!actionTarget) return
    run(() => {
      setData(p => p.map(d => d.id === actionTarget.id ? { ...d, trangThai: 'da_duyet', ghiChuDuyet: ghiChuDuyet || 'Đã duyệt.' } : d))
      message.success('Đã duyệt yêu cầu!')
      setDuyetOpen(false); setGhiChuDuyet('')
    })
  }

  const handleTuChoi = () => {
    if (!actionTarget) return
    run(() => {
      setData(p => p.map(d => d.id === actionTarget.id ? { ...d, trangThai: 'tu_choi', ghiChuDuyet: ghiChuDuyet || 'Từ chối.' } : d))
      message.success('Đã từ chối yêu cầu!')
      setTuChoiOpen(false); setGhiChuDuyet('')
    })
  }

  const handleTao = () => {
    form.validateFields().then(v => {
      run(() => {
        setData(p => [{ id: String(Date.now()), maYC: genMA(), ...v, nguoiTao: NGUOI_TAO[0], trangThai: 'cho_duyet', ngayTao: new Date().toLocaleString('vi-VN') }, ...p])
        message.success('Tạo yêu cầu thành công!')
        setModalOpen(false); form.resetFields()
      })
    })
  }

  const counts = {
    total: data.length,
    choDuyet: data.filter(d => d.trangThai === 'cho_duyet').length,
    daDuyet: data.filter(d => d.trangThai === 'da_duyet').length,
    tuChoi: data.filter(d => d.trangThai === 'tu_choi').length,
  }

  const columns: ColumnsType<YeuCau> = [
    { title: 'STT', key: 'stt', width: 55, render: (_, __, i) => <Text type='secondary'>{i + 1}</Text> },
    { title: 'Mã YC', dataIndex: 'maYC', key: 'ma', width: 105 },
    {
      title: 'Loại', dataIndex: 'loai', key: 'loai', width: 95,
      render: (v: LoaiYC) => <Tag color={v === 'nhap' ? 'green' : 'blue'}>{v === 'nhap' ? '↓ Nhập kho' : '↑ Xuất kho'}</Tag>
    },
    { title: 'Người tạo', dataIndex: 'nguoiTao', key: 'nt', width: 150 },
    { title: 'Vật tư', dataIndex: 'tenVatTu', key: 'tv', ellipsis: true },
    { title: 'Số lượng', dataIndex: 'soLuong', key: 'sl', width: 90, align: 'center' },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', key: 'tt', width: 120,
      render: (v: TrangThaiYC) => <Tag color={TRANG_THAI[v].color}>{TRANG_THAI[v].label}</Tag>
    },
    { title: 'Ngày tạo', dataIndex: 'ngayTao', key: 'ng', width: 155 },
    {
      title: 'Hành động', key: 'act', width: 200,
      render: (_, r) => (
        <Space size={4} split={<Text type='secondary'>|</Text>}>
          <Button type='link' size='small' onClick={() => { setSelected(r); setDrawerOpen(true) }}>Chi tiết</Button>
          {r.trangThai === 'cho_duyet' && <>
            <Button type='link' size='small' style={{ color: '#52c41a' }} icon={<CheckOutlined />}
              onClick={() => { setActionTarget(r); setGhiChuDuyet(''); setDuyetOpen(true) }}>Duyệt</Button>
            <Button type='link' size='small' danger icon={<CloseOutlined />}
              onClick={() => { setActionTarget(r); setGhiChuDuyet(''); setTuChoiOpen(true) }}>Từ chối</Button>
          </>}
        </Space>
      )
    }
  ]

  return (
    <div>
      <Breadcrumb className='mb-4' items={[{ title: <HomeOutlined />, href: '/' }, { title: 'Yêu cầu' }]} />

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Tổng yêu cầu', value: counts.total, color: PRIMARY },
          { label: 'Chờ duyệt', value: counts.choDuyet, color: '#faad14' },
          { label: 'Đã duyệt', value: counts.daDuyet, color: '#52c41a' },
          { label: 'Từ chối', value: counts.tuChoi, color: '#ff4d4f' },
        ].map((s, i) => (
          <Card key={i} style={{ borderRadius: 10, flex: 1, minWidth: 110, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <Text type='secondary' style={{ fontSize: 12 }}>{s.label}</Text>
          </Card>
        ))}
      </div>

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Title level={4} style={{ margin: 0 }}>Danh sách yêu cầu</Title>
          <Button type='primary' icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true) }}>Tạo yêu cầu</Button>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input.Search placeholder='Tìm mã, vật tư, người tạo...' style={{ width: 260 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
          <Select placeholder='Loại yêu cầu' style={{ width: 140 }} allowClear value={filterLoai} onChange={setFilterLoai}
            options={[{ value: 'nhap', label: 'Nhập kho' }, { value: 'xuat', label: 'Xuất kho' }]} />
          <Select placeholder='Trạng thái' style={{ width: 140 }} allowClear value={filterTT} onChange={setFilterTT}
            options={[{ value: 'cho_duyet', label: 'Chờ duyệt' }, { value: 'da_duyet', label: 'Đã duyệt' }, { value: 'tu_choi', label: 'Từ chối' }]} />
        </div>
        <Table rowKey='id' loading={loading} columns={columns} dataSource={filtered} bordered size='middle'
          pagination={{ pageSize: 10, showTotal: t => `Tổng ${t} yêu cầu` }} />
      </Card>

      <Drawer title='Chi tiết yêu cầu' width={520} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {selected && (
          <>
            <Descriptions bordered column={2} size='small' style={{ marginBottom: 24 }}>
              <Descriptions.Item label='Mã yêu cầu'>{selected.maYC}</Descriptions.Item>
              <Descriptions.Item label='Loại'><Tag color={selected.loai === 'nhap' ? 'green' : 'blue'}>{selected.loai === 'nhap' ? 'Nhập kho' : 'Xuất kho'}</Tag></Descriptions.Item>
              <Descriptions.Item label='Người tạo'>{selected.nguoiTao}</Descriptions.Item>
              <Descriptions.Item label='Trạng thái'><Tag color={TRANG_THAI[selected.trangThai].color}>{TRANG_THAI[selected.trangThai].label}</Tag></Descriptions.Item>
              <Descriptions.Item label='Vật tư' span={2}>{selected.tenVatTu}</Descriptions.Item>
              <Descriptions.Item label='Số lượng'>{selected.soLuong}</Descriptions.Item>
              <Descriptions.Item label='Ngày tạo'>{selected.ngayTao}</Descriptions.Item>
              <Descriptions.Item label='Lý do' span={2}>{selected.lyDo}</Descriptions.Item>
              {selected.ghiChuDuyet && <Descriptions.Item label='Ghi chú duyệt' span={2}><Text style={{ color: selected.trangThai === 'tu_choi' ? '#ff4d4f' : '#52c41a' }}>{selected.ghiChuDuyet}</Text></Descriptions.Item>}
            </Descriptions>

            <Title level={5}>Tiến trình xử lý</Title>
            <Timeline items={[
              { color: 'green', children: <><Text strong>Tạo yêu cầu</Text><br /><Text type='secondary' style={{ fontSize: 12 }}>{selected.ngayTao} — {selected.nguoiTao}</Text></> },
              ...(selected.trangThai !== 'cho_duyet' ? [{ color: selected.trangThai === 'da_duyet' ? 'green' : 'red', dot: selected.trangThai === 'da_duyet' ? <CheckOutlined /> : <CloseOutlined />, children: <><Text strong>{selected.trangThai === 'da_duyet' ? 'Đã duyệt' : 'Từ chối'}</Text><br /><Text type='secondary' style={{ fontSize: 12 }}>{selected.ghiChuDuyet}</Text></> }] : [{ color: 'gold', dot: <ClockCircleOutlined />, children: <Text type='secondary'>Đang chờ xét duyệt...</Text> }])
            ]} />

            {selected.trangThai === 'cho_duyet' && (
              <Space style={{ marginTop: 16 }}>
                <Button type='primary' style={{ background: '#52c41a' }} icon={<CheckOutlined />} onClick={() => { setActionTarget(selected); setGhiChuDuyet(''); setDrawerOpen(false); setDuyetOpen(true) }}>Duyệt</Button>
                <Button danger icon={<CloseOutlined />} onClick={() => { setActionTarget(selected); setGhiChuDuyet(''); setDrawerOpen(false); setTuChoiOpen(true) }}>Từ chối</Button>
              </Space>
            )}
          </>
        )}
      </Drawer>

      <Modal title='Tạo yêu cầu' open={modalOpen} onCancel={() => setModalOpen(false)}
        footer={[<Button key='c' onClick={() => setModalOpen(false)}>Huỷ</Button>, <Button key='s' type='primary' loading={loading} onClick={handleTao}>Gửi yêu cầu</Button>]}>
        <Form form={form} layout='vertical' style={{ marginTop: 16 }}>
          <Space style={{ width: '100%' }} styles={{ item: { flex: 1 } }}>
            <Form.Item label='Loại yêu cầu' name='loai' rules={[{ required: true, message: 'Chọn loại' }]}>
              <Select options={[{ value: 'nhap', label: 'Nhập kho' }, { value: 'xuat', label: 'Xuất kho' }]} />
            </Form.Item>
            <Form.Item label='Số lượng' name='soLuong' rules={[{ required: true, message: 'Nhập số lượng' }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item label='Vật tư' name='tenVatTu' rules={[{ required: true, message: 'Chọn vật tư' }]}>
            <Select showSearch options={VAT_TU_LIST.map(v => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item label='Lý do / Mục đích' name='lyDo' rules={[{ required: true, message: 'Nhập lý do' }]}>
            <Input.TextArea rows={3} placeholder='Giải thích lý do yêu cầu...' />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={<Space><CheckOutlined style={{ color: '#52c41a' }} />Xác nhận duyệt yêu cầu</Space>}
        open={duyetOpen} onCancel={() => setDuyetOpen(false)}
        footer={[<Button key='c' onClick={() => setDuyetOpen(false)}>Huỷ</Button>, <Button key='d' style={{ background: '#52c41a' }} type='primary' loading={loading} onClick={handleDuyet}>Duyệt</Button>]}>
        <Text>Duyệt yêu cầu <Text strong>"{actionTarget?.maYC}"</Text> — {actionTarget?.tenVatTu} x{actionTarget?.soLuong}?</Text>
        <Input.TextArea style={{ marginTop: 12 }} rows={2} placeholder='Ghi chú khi duyệt (không bắt buộc)' value={ghiChuDuyet} onChange={e => setGhiChuDuyet(e.target.value)} />
      </Modal>

      <Modal title={<Space><CloseOutlined style={{ color: '#ff4d4f' }} />Từ chối yêu cầu</Space>}
        open={tuChoiOpen} onCancel={() => setTuChoiOpen(false)}
        footer={[<Button key='c' onClick={() => setTuChoiOpen(false)}>Huỷ</Button>, <Button key='d' danger type='primary' loading={loading} onClick={handleTuChoi}>Từ chối</Button>]}>
        <Text>Từ chối yêu cầu <Text strong style={{ color: '#ff4d4f' }}>"{actionTarget?.maYC}"</Text>?</Text>
        <Input.TextArea style={{ marginTop: 12 }} rows={2} placeholder='Lý do từ chối (bắt buộc)' value={ghiChuDuyet} onChange={e => setGhiChuDuyet(e.target.value)} />
      </Modal>
    </div>
  )
}

export default YeuCauPage
