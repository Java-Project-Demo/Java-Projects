import { useState, useMemo } from 'react'
import {
  Avatar, Button, Card, Col, DatePicker, Descriptions, Drawer,
  Form, Input, InputNumber, message, Modal, Progress, Row,
  Select, Space, Statistic, Table, Tabs, Tag, Tooltip,
  Typography, Upload
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
  ShoppingOutlined, WarningOutlined, ImportOutlined, ExportOutlined,
  ArrowUpOutlined, PrinterOutlined, InboxOutlined,
  FileExcelOutlined, BarcodeOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

// ─── Types ────────────────────────────────────────────────────────────────────

type TrangThai = 'con_hang' | 'sap_het' | 'het_hang'

interface LichSuItem {
  id: string
  ngay: string
  loai: 'nhap' | 'xuat'
  soLuong: number
  nguoiThucHien: string
  ghiChu: string
}

interface SanPham {
  id: string
  sku: string
  ten: string
  danhMuc: string
  donVi: string
  tonKho: number
  nguongCanhBao: number
  giaNhap: number
  giaXuat: number
  trangThai: TrangThai
  anhUrl: string
  capNhatLuc: string
  lichSu: LichSuItem[]
}

interface FormValues {
  ten: string
  sku: string
  danhMuc: string
  donVi: string
  giaNhap: number
  giaXuat: number
  tonKho: number
  nguongCanhBao: number
  moTa?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DANH_MUC_OPTIONS = ['Điện tử', 'Cơ khí', 'Văn phòng phẩm', 'Thiết bị y tế', 'Dụng cụ']
const DON_VI_OPTIONS = ['Cái', 'Hộp', 'Kg', 'Lít', 'Bộ', 'Cuộn']
const PRIMARY = '#E8603C'

const TRANG_THAI_CONFIG: Record<TrangThai, { label: string; color: string }> = {
  con_hang: { label: 'Còn hàng', color: 'green' },
  sap_het: { label: 'Sắp hết', color: 'orange' },
  het_hang: { label: 'Hết hàng', color: 'red' }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const calcTrangThai = (tonKho: number, nguong: number): TrangThai => {
  if (tonKho === 0) return 'het_hang'
  if (tonKho < nguong) return 'sap_het'
  return 'con_hang'
}

const fmtCurrency = (val: number) =>
  val.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

const genSKU = () => `SP-${Math.floor(10000 + Math.random() * 90000)}`

const stockColor = (tonKho: number, nguong: number) => {
  if (tonKho === 0) return '#ff4d4f'
  if (tonKho < nguong) return '#faad14'
  return '#52c41a'
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mkLichSu = (): LichSuItem[] => [
  { id: '1', ngay: '2024-03-10 08:30', loai: 'nhap', soLuong: 50, nguoiThucHien: 'Nguyễn Văn A', ghiChu: 'Nhập hàng định kỳ' },
  { id: '2', ngay: '2024-03-12 14:00', loai: 'xuat', soLuong: 20, nguoiThucHien: 'Trần Thị B', ghiChu: 'Xuất cho đơn hàng #DH001' },
  { id: '3', ngay: '2024-03-15 09:15', loai: 'nhap', soLuong: 30, nguoiThucHien: 'Nguyễn Văn A', ghiChu: 'Bổ sung hàng tháng 3' },
  { id: '4', ngay: '2024-03-18 16:30', loai: 'xuat', soLuong: 15, nguoiThucHien: 'Lê Văn C', ghiChu: 'Xuất cho khách VIP' },
  { id: '5', ngay: '2024-03-20 10:00', loai: 'xuat', soLuong: 10, nguoiThucHien: 'Phạm Thị D', ghiChu: 'Xuất nội bộ phòng kỹ thuật' }
]

const INIT_DATA: SanPham[] = [
  { id: '1',  sku: 'SP-10001', ten: 'Máy khoan điện Bosch GSB 550',          danhMuc: 'Dụng cụ',         donVi: 'Cái',  tonKho: 45,  nguongCanhBao: 20, giaNhap: 1200000,  giaXuat: 1800000,  trangThai: 'con_hang', anhUrl: '', capNhatLuc: '2024-03-20 10:30', lichSu: mkLichSu() },
  { id: '2',  sku: 'SP-10002', ten: 'Laptop Dell XPS 15 9530',                danhMuc: 'Điện tử',         donVi: 'Cái',  tonKho: 12,  nguongCanhBao: 20, giaNhap: 22000000, giaXuat: 28000000, trangThai: 'sap_het',  anhUrl: '', capNhatLuc: '2024-03-19 14:20', lichSu: mkLichSu() },
  { id: '3',  sku: 'SP-10003', ten: 'Máy bơm nước Panasonic GP-200JXK',       danhMuc: 'Cơ khí',          donVi: 'Cái',  tonKho: 8,   nguongCanhBao: 20, giaNhap: 1500000,  giaXuat: 2200000,  trangThai: 'sap_het',  anhUrl: '', capNhatLuc: '2024-03-18 09:15', lichSu: mkLichSu() },
  { id: '4',  sku: 'SP-10004', ten: 'Bút bi Thiên Long RT-007',               danhMuc: 'Văn phòng phẩm',  donVi: 'Hộp',  tonKho: 150, nguongCanhBao: 20, giaNhap: 15000,    giaXuat: 25000,    trangThai: 'con_hang', anhUrl: '', capNhatLuc: '2024-03-17 11:00', lichSu: mkLichSu() },
  { id: '5',  sku: 'SP-10005', ten: 'Máy đo huyết áp Omron HEM-7120',         danhMuc: 'Thiết bị y tế',   donVi: 'Cái',  tonKho: 0,   nguongCanhBao: 20, giaNhap: 800000,   giaXuat: 1200000,  trangThai: 'het_hang', anhUrl: '', capNhatLuc: '2024-03-16 08:45', lichSu: mkLichSu() },
  { id: '6',  sku: 'SP-10006', ten: 'Động cơ điện 3 pha 5.5kW',               danhMuc: 'Cơ khí',          donVi: 'Cái',  tonKho: 25,  nguongCanhBao: 20, giaNhap: 3000000,  giaXuat: 4500000,  trangThai: 'con_hang', anhUrl: '', capNhatLuc: '2024-03-15 16:30', lichSu: mkLichSu() },
  { id: '7',  sku: 'SP-10007', ten: 'Màn hình Samsung 24" F24T350',           danhMuc: 'Điện tử',         donVi: 'Cái',  tonKho: 18,  nguongCanhBao: 20, giaNhap: 3500000,  giaXuat: 4800000,  trangThai: 'sap_het',  anhUrl: '', capNhatLuc: '2024-03-14 13:20', lichSu: mkLichSu() },
  { id: '8',  sku: 'SP-10008', ten: 'Giấy A4 Double A 80gsm',                 danhMuc: 'Văn phòng phẩm',  donVi: 'Hộp',  tonKho: 200, nguongCanhBao: 20, giaNhap: 85000,    giaXuat: 120000,   trangThai: 'con_hang', anhUrl: '', capNhatLuc: '2024-03-13 10:00', lichSu: mkLichSu() },
  { id: '9',  sku: 'SP-10009', ten: 'Kẹp giấy bướm 51mm Deli',               danhMuc: 'Văn phòng phẩm',  donVi: 'Hộp',  tonKho: 80,  nguongCanhBao: 20, giaNhap: 12000,    giaXuat: 20000,    trangThai: 'con_hang', anhUrl: '', capNhatLuc: '2024-03-12 09:30', lichSu: mkLichSu() },
  { id: '10', sku: 'SP-10010', ten: 'Máy hàn điện Riland ARC-200',            danhMuc: 'Dụng cụ',         donVi: 'Cái',  tonKho: 15,  nguongCanhBao: 20, giaNhap: 2800000,  giaXuat: 3900000,  trangThai: 'sap_het',  anhUrl: '', capNhatLuc: '2024-03-11 14:45', lichSu: mkLichSu() },
  { id: '11', sku: 'SP-10011', ten: 'Ống nghe y tế 3M Littmann Classic III',  danhMuc: 'Thiết bị y tế',   donVi: 'Cái',  tonKho: 0,   nguongCanhBao: 20, giaNhap: 1200000,  giaXuat: 1800000,  trangThai: 'het_hang', anhUrl: '', capNhatLuc: '2024-03-10 08:20', lichSu: mkLichSu() },
  { id: '12', sku: 'SP-10012', ten: 'Điện thoại Samsung Galaxy S24',           danhMuc: 'Điện tử',         donVi: 'Cái',  tonKho: 30,  nguongCanhBao: 20, giaNhap: 18000000, giaXuat: 22000000, trangThai: 'con_hang', anhUrl: '', capNhatLuc: '2024-03-09 11:15', lichSu: mkLichSu() },
  { id: '13', sku: 'SP-10013', ten: 'Máy cắt kim loại Makita GA5030',          danhMuc: 'Cơ khí',          donVi: 'Cái',  tonKho: 10,  nguongCanhBao: 20, giaNhap: 4500000,  giaXuat: 6000000,  trangThai: 'sap_het',  anhUrl: '', capNhatLuc: '2024-03-08 15:00', lichSu: mkLichSu() },
  { id: '14', sku: 'SP-10014', ten: 'Dao mổ y tế hộp 100 cái',                danhMuc: 'Thiết bị y tế',   donVi: 'Hộp',  tonKho: 55,  nguongCanhBao: 20, giaNhap: 180000,   giaXuat: 280000,   trangThai: 'con_hang', anhUrl: '', capNhatLuc: '2024-03-07 09:45', lichSu: mkLichSu() },
  { id: '15', sku: 'SP-10015', ten: 'Mũi khoan inox bộ 10 cái',               danhMuc: 'Dụng cụ',         donVi: 'Bộ',   tonKho: 60,  nguongCanhBao: 20, giaNhap: 250000,   giaXuat: 380000,   trangThai: 'con_hang', anhUrl: '', capNhatLuc: '2024-03-06 12:30', lichSu: mkLichSu() },
  { id: '16', sku: 'SP-10016', ten: 'RAM DDR5 16GB Kingston Fury Beast',       danhMuc: 'Điện tử',         donVi: 'Cái',  tonKho: 0,   nguongCanhBao: 20, giaNhap: 1100000,  giaXuat: 1500000,  trangThai: 'het_hang', anhUrl: '', capNhatLuc: '2024-03-05 10:00', lichSu: mkLichSu() },
  { id: '17', sku: 'SP-10017', ten: 'Bình xịt cồn sát khuẩn 500ml',           danhMuc: 'Thiết bị y tế',   donVi: 'Lít',  tonKho: 90,  nguongCanhBao: 20, giaNhap: 35000,    giaXuat: 55000,    trangThai: 'con_hang', anhUrl: '', capNhatLuc: '2024-03-04 08:30', lichSu: mkLichSu() },
  { id: '18', sku: 'SP-10018', ten: 'Kéo cắt đa năng Stanley',                danhMuc: 'Dụng cụ',         donVi: 'Cái',  tonKho: 120, nguongCanhBao: 20, giaNhap: 45000,    giaXuat: 75000,    trangThai: 'con_hang', anhUrl: '', capNhatLuc: '2024-03-03 14:15', lichSu: mkLichSu() },
  { id: '19', sku: 'SP-10019', ten: 'Thước kẹp điện tử 150mm Mitutoyo',       danhMuc: 'Dụng cụ',         donVi: 'Cái',  tonKho: 35,  nguongCanhBao: 20, giaNhap: 380000,   giaXuat: 550000,   trangThai: 'con_hang', anhUrl: '', capNhatLuc: '2024-03-02 11:45', lichSu: mkLichSu() },
  { id: '20', sku: 'SP-10020', ten: 'Hộp mực in HP 85A CE285A',               danhMuc: 'Văn phòng phẩm',  donVi: 'Hộp',  tonKho: 25,  nguongCanhBao: 20, giaNhap: 280000,   giaXuat: 420000,   trangThai: 'con_hang', anhUrl: '', capNhatLuc: '2024-03-01 09:00', lichSu: mkLichSu() }
]

// ─── Main Component ───────────────────────────────────────────────────────────

const KhoHangPage = () => {
  const [data, setData] = useState<SanPham[]>(INIT_DATA)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterDanhMuc, setFilterDanhMuc] = useState<string | undefined>()
  const [filterTrangThai, setFilterTrangThai] = useState<TrangThai | undefined>()
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([])
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerItem, setDrawerItem] = useState<SanPham | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<SanPham | null>(null)
  const [previewImage, setPreviewImage] = useState('')
  const [form] = Form.useForm<FormValues>()

  const [deleteItem, setDeleteItem] = useState<SanPham | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const simulateLoad = (cb: () => void) => {
    setLoading(true)
    setTimeout(() => { cb(); setLoading(false) }, 600)
  }

  const stats = useMemo(() => ({
    total: data.length,
    sapHet: data.filter(d => d.trangThai !== 'con_hang').length,
    nhapThang: data.reduce((s, d) => s + d.lichSu.filter(l => l.loai === 'nhap').reduce((a, b) => a + b.soLuong, 0), 0),
    xuatThang: data.reduce((s, d) => s + d.lichSu.filter(l => l.loai === 'xuat').reduce((a, b) => a + b.soLuong, 0), 0)
  }), [data])

  const filtered = useMemo(() =>
    data.filter(d => {
      const matchSearch = !search ||
        d.ten.toLowerCase().includes(search.toLowerCase()) ||
        d.sku.toLowerCase().includes(search.toLowerCase())
      const matchDM = !filterDanhMuc || d.danhMuc === filterDanhMuc
      const matchTT = !filterTrangThai || d.trangThai === filterTrangThai
      return matchSearch && matchDM && matchTT
    }), [data, search, filterDanhMuc, filterTrangThai])

  const openAdd = () => {
    setEditItem(null)
    setPreviewImage('')
    form.resetFields()
    form.setFieldValue('sku', genSKU())
    form.setFieldValue('nguongCanhBao', 20)
    setModalOpen(true)
  }

  const openEdit = (record: SanPham) => {
    setEditItem(record)
    setPreviewImage('')
    form.setFieldsValue({ ...record })
    setModalOpen(true)
  }

  const handleSave = () => {
    form.validateFields().then(values => {
      simulateLoad(() => {
        if (editItem) {
          setData(prev => prev.map(d => d.id === editItem.id
            ? { ...d, ...values, trangThai: calcTrangThai(values.tonKho, values.nguongCanhBao), capNhatLuc: new Date().toLocaleString('vi-VN') }
            : d))
          message.success('Cập nhật sản phẩm thành công!')
        } else {
          setData(prev => [{
            id: String(Date.now()), ...values,
            trangThai: calcTrangThai(values.tonKho, values.nguongCanhBao),
            anhUrl: previewImage, capNhatLuc: new Date().toLocaleString('vi-VN'),
            lichSu: mkLichSu()
          }, ...prev])
          message.success('Thêm sản phẩm thành công!')
        }
        setModalOpen(false)
      })
    })
  }

  const handleDelete = () => {
    if (!deleteItem) return
    simulateLoad(() => {
      setData(prev => prev.filter(d => d.id !== deleteItem.id))
      message.success(`Đã xoá "${deleteItem.ten}"`)
      setDeleteOpen(false)
      setDeleteItem(null)
    })
  }

  const handleBulkDelete = () => {
    simulateLoad(() => {
      setData(prev => prev.filter(d => !selectedKeys.includes(d.id)))
      message.success(`Đã xoá ${selectedKeys.length} sản phẩm`)
      setSelectedKeys([])
    })
  }

  const cardStyle = (idx: number) => ({
    borderRadius: 12,
    boxShadow: hoveredCard === idx ? '0 12px 32px rgba(0,0,0,0.14)' : '0 2px 10px rgba(0,0,0,0.07)',
    transform: hoveredCard === idx ? 'translateY(-5px)' : 'translateY(0)',
    transition: 'all 0.25s ease',
    cursor: 'default',
    height: '100%'
  })

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns: ColumnsType<SanPham> = [
    {
      title: 'STT', key: 'stt', width: 55, fixed: 'left',
      render: (_, __, i) => <Text type='secondary'>{i + 1}</Text>
    },
    {
      title: 'Sản phẩm', key: 'product', width: 280, fixed: 'left',
      render: (_, r) => (
        <Space>
          <Avatar shape='square' size={40} style={{ background: PRIMARY, fontWeight: 700, flexShrink: 0 }}>
            {r.ten.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.ten}</div>
            <Text type='secondary' style={{ fontSize: 12 }}>{r.sku}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Danh mục', dataIndex: 'danhMuc', key: 'danhMuc', width: 140,
      render: v => <Tag>{v}</Tag>
    },
    {
      title: 'Tồn kho', key: 'tonKho', width: 140,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 700, color: stockColor(r.tonKho, r.nguongCanhBao), marginBottom: 4 }}>
            {r.tonKho} {r.donVi}
          </div>
          <Progress
            percent={Math.min(100, Math.round((r.tonKho / 200) * 100))}
            showInfo={false} size='small'
            strokeColor={stockColor(r.tonKho, r.nguongCanhBao)}
          />
        </div>
      )
    },
    {
      title: 'Giá nhập', dataIndex: 'giaNhap', key: 'giaNhap', width: 130,
      render: fmtCurrency
    },
    {
      title: 'Giá xuất', dataIndex: 'giaXuat', key: 'giaXuat', width: 130,
      render: fmtCurrency
    },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', width: 110,
      render: (v: TrangThai) => <Tag color={TRANG_THAI_CONFIG[v].color}>{TRANG_THAI_CONFIG[v].label}</Tag>
    },
    {
      title: 'Cập nhật', dataIndex: 'capNhatLuc', key: 'capNhatLuc', width: 150,
      render: v => <Text type='secondary' style={{ fontSize: 12 }}>{v}</Text>
    },
    {
      title: 'Hành động', key: 'action', width: 110, fixed: 'right',
      render: (_, record) => (
        <Space size={2}>
          <Tooltip title='Xem chi tiết'>
            <Button type='text' size='small' icon={<EyeOutlined style={{ color: PRIMARY }} />}
              onClick={() => { setDrawerItem(record); setDrawerOpen(true) }} />
          </Tooltip>
          <Tooltip title='Chỉnh sửa'>
            <Button type='text' size='small' icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title='Xoá'>
            <Button type='text' size='small' danger icon={<DeleteOutlined />}
              onClick={() => { setDeleteItem(record); setDeleteOpen(true) }} />
          </Tooltip>
        </Space>
      )
    }
  ]

  const lichSuColumns: ColumnsType<LichSuItem> = [
    { title: 'Ngày', dataIndex: 'ngay', key: 'ngay', width: 150 },
    {
      title: 'Loại', dataIndex: 'loai', key: 'loai', width: 90,
      render: (v: 'nhap' | 'xuat') => (
        <Tag color={v === 'nhap' ? 'green' : 'blue'}
          icon={v === 'nhap' ? <ImportOutlined /> : <ExportOutlined />}>
          {v === 'nhap' ? 'Nhập' : 'Xuất'}
        </Tag>
      )
    },
    { title: 'Số lượng', dataIndex: 'soLuong', key: 'soLuong', width: 90 },
    { title: 'Người thực hiện', dataIndex: 'nguoiThucHien', key: 'nguoiThucHien' },
    { title: 'Ghi chú', dataIndex: 'ghiChu', key: 'ghiChu', ellipsis: true }
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20 }}>Quản lý kho hàng</Title>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            title: 'Tổng sản phẩm', value: stats.total, icon: <ShoppingOutlined />,
            color: PRIMARY, suffix: 'sản phẩm', trend: '+5%'
          },
          {
            title: 'Cần chú ý', value: stats.sapHet, icon: <WarningOutlined />,
            color: '#faad14', suffix: 'mặt hàng', trend: '+2'
          },
          {
            title: 'Nhập tháng này', value: stats.nhapThang, icon: <ImportOutlined />,
            color: '#52c41a', suffix: 'đơn vị', trend: '+12%'
          },
          {
            title: 'Xuất tháng này', value: stats.xuatThang, icon: <ExportOutlined />,
            color: '#1677ff', suffix: 'đơn vị', trend: '+8%'
          }
        ].map((card, idx) => (
          <Col xs={24} sm={12} xl={6} key={idx}>
            <Card
              style={cardStyle(idx)}
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type='secondary' style={{ fontSize: 13 }}>{card.title}</Text>
                  <Statistic
                    value={card.value}
                    suffix={<span style={{ fontSize: 13, color: '#888' }}>{card.suffix}</span>}
                    valueStyle={{ fontSize: 28, fontWeight: 700, color: card.color }}
                  />
                  <Space size={4} style={{ marginTop: 4 }}>
                    <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                    <Text style={{ fontSize: 12, color: '#52c41a' }}>{card.trend} so với tháng trước</Text>
                  </Space>
                </div>
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: `${card.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, color: card.color
                }}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Table Card */}
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>

        {/* Bulk Action Bar */}
        {selectedKeys.length > 0 && (
          <div style={{
            background: '#fff7e6', border: '1px solid #ffd591',
            borderRadius: 8, padding: '10px 16px', marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <Text>Đã chọn <strong style={{ color: PRIMARY }}>{selectedKeys.length}</strong> sản phẩm</Text>
            <Space>
              <Button size='small' icon={<FileExcelOutlined />}
                onClick={() => message.info('Tính năng xuất Excel đang phát triển')}>
                Xuất Excel
              </Button>
              <Button size='small' danger onClick={handleBulkDelete}>Xoá tất cả</Button>
            </Space>
          </div>
        )}

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input.Search
            placeholder='Tìm tên sản phẩm, mã SKU...'
            style={{ width: 260 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
          />
          <Select
            placeholder='Danh mục'
            style={{ width: 160 }}
            allowClear
            value={filterDanhMuc}
            onChange={setFilterDanhMuc}
            options={DANH_MUC_OPTIONS.map(d => ({ value: d, label: d }))}
          />
          <Select
            placeholder='Trạng thái'
            style={{ width: 140 }}
            allowClear
            value={filterTrangThai}
            onChange={setFilterTrangThai}
            options={[
              { value: 'con_hang', label: 'Còn hàng' },
              { value: 'sap_het', label: 'Sắp hết' },
              { value: 'het_hang', label: 'Hết hàng' }
            ]}
          />
          <RangePicker placeholder={['Từ ngày', 'Đến ngày']} />
          <div style={{ marginLeft: 'auto' }}>
            <Button type='primary' icon={<PlusOutlined />} onClick={openAdd}>
              Thêm sản phẩm
            </Button>
          </div>
        </div>

        {/* Table */}
        <Table
          rowKey='id'
          loading={loading}
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1200 }}
          sticky
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: setSelectedKeys
          }}
          onRow={record => ({
            style: record.trangThai === 'het_hang' ? { background: '#fff1f0' } : {}
          })}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} sản phẩm`
          }}
          locale={{
            emptyText: (
              <div style={{ padding: '40px 0' }}>
                <InboxOutlined style={{ fontSize: 48, color: '#ccc', display: 'block', marginBottom: 12 }} />
                <Text type='secondary'>Không tìm thấy sản phẩm nào</Text>
              </div>
            )
          }}
          size='middle'
          bordered
        />
      </Card>

      {/* ── Detail Drawer ──────────────────────────────────────────────────── */}
      <Drawer
        title={
          drawerItem && (
            <Space>
              <Avatar shape='square' style={{ background: PRIMARY, fontWeight: 700 }}>
                {drawerItem.ten.charAt(0)}
              </Avatar>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{drawerItem.ten}</div>
                <Text type='secondary' style={{ fontSize: 12, fontWeight: 400 }}>{drawerItem.sku}</Text>
              </div>
            </Space>
          )
        }
        width={620}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => { setDrawerOpen(false); drawerItem && openEdit(drawerItem) }}
              icon={<EditOutlined />}>Sửa</Button>
          </Space>
        }
      >
        {drawerItem && (
          <Tabs
            items={[
              {
                key: 'info',
                label: 'Thông tin chung',
                children: (
                  <>
                    <div style={{
                      background: `${PRIMARY}10`, borderRadius: 10,
                      padding: 16, marginBottom: 20,
                      display: 'flex', gap: 24, flexWrap: 'wrap'
                    }}>
                      <Statistic title='Tồn kho' value={drawerItem.tonKho}
                        suffix={drawerItem.donVi}
                        valueStyle={{ color: stockColor(drawerItem.tonKho, drawerItem.nguongCanhBao), fontWeight: 700 }} />
                      <Statistic title='Giá nhập' value={drawerItem.giaNhap}
                        formatter={v => fmtCurrency(Number(v))} />
                      <Statistic title='Giá xuất' value={drawerItem.giaXuat}
                        formatter={v => fmtCurrency(Number(v))} />
                    </div>
                    <Descriptions bordered column={2} size='small'>
                      <Descriptions.Item label='Mã SKU'>{drawerItem.sku}</Descriptions.Item>
                      <Descriptions.Item label='Trạng thái'>
                        <Tag color={TRANG_THAI_CONFIG[drawerItem.trangThai].color}>
                          {TRANG_THAI_CONFIG[drawerItem.trangThai].label}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label='Danh mục'>{drawerItem.danhMuc}</Descriptions.Item>
                      <Descriptions.Item label='Đơn vị'>{drawerItem.donVi}</Descriptions.Item>
                      <Descriptions.Item label='Ngưỡng cảnh báo'>{drawerItem.nguongCanhBao} {drawerItem.donVi}</Descriptions.Item>
                      <Descriptions.Item label='Cập nhật lần cuối'>{drawerItem.capNhatLuc}</Descriptions.Item>
                      <Descriptions.Item label='Lãi gộp / đơn vị' span={2}>
                        <Text style={{ color: '#52c41a', fontWeight: 700 }}>
                          {fmtCurrency(drawerItem.giaXuat - drawerItem.giaNhap)}
                        </Text>
                        <Text type='secondary' style={{ marginLeft: 8 }}>
                          ({Math.round(((drawerItem.giaXuat - drawerItem.giaNhap) / drawerItem.giaNhap) * 100)}%)
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </>
                )
              },
              {
                key: 'history',
                label: 'Lịch sử nhập/xuất',
                children: (
                  <Table
                    rowKey='id'
                    columns={lichSuColumns}
                    dataSource={drawerItem.lichSu}
                    pagination={false}
                    size='small'
                    bordered
                  />
                )
              },
              {
                key: 'barcode',
                label: <span><BarcodeOutlined /> Barcode</span>,
                children: (
                  <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{
                      display: 'inline-block',
                      background: '#fff',
                      border: '1px solid #eee',
                      borderRadius: 12,
                      padding: '32px 48px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                    }}>
                      <div style={{
                        fontSize: 13, color: '#888', marginBottom: 12, letterSpacing: 2
                      }}>
                        WAREHOUSE MANAGEMENT SYSTEM
                      </div>
                      <div style={{
                        fontFamily: 'monospace', fontSize: 42, fontWeight: 700,
                        letterSpacing: 6, color: '#222', marginBottom: 8
                      }}>
                        {drawerItem.sku}
                      </div>
                      <div style={{ fontSize: 13, color: '#555', marginBottom: 24 }}>
                        {drawerItem.ten}
                      </div>
                      <Button type='primary' icon={<PrinterOutlined />}
                        onClick={() => { window.print(); message.success('Đang in barcode...') }}>
                        In barcode
                      </Button>
                    </div>
                  </div>
                )
              }
            ]}
          />
        )}
      </Drawer>

      {/* ── Add/Edit Modal ─────────────────────────────────────────────────── */}
      <Modal
        title={
          <Space>
            <div style={{ width: 4, height: 18, background: PRIMARY, borderRadius: 2 }} />
            {editItem ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </Space>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={700}
        footer={[
          <Button key='cancel' onClick={() => setModalOpen(false)}>Huỷ</Button>,
          <Button key='draft' onClick={() => message.info('Đã lưu nháp!')}>Lưu nháp</Button>,
          <Button key='save' type='primary' loading={loading} onClick={handleSave}>
            Lưu & Đóng
          </Button>
        ]}
      >
        <Form form={form} layout='vertical' style={{ marginTop: 16 }}>
          {/* Upload */}
          <Form.Item label='Ảnh sản phẩm'>
            <Upload.Dragger
              accept='image/*' maxCount={1} showUploadList={false}
              beforeUpload={file => {
                const reader = new FileReader()
                reader.onload = e => setPreviewImage(e.target?.result as string)
                reader.readAsDataURL(file)
                return false
              }}
              style={{ borderRadius: 8 }}
            >
              {previewImage
                ? <img src={previewImage} alt='preview'
                    style={{ maxHeight: 100, objectFit: 'contain', borderRadius: 6 }} />
                : (
                  <>
                    <InboxOutlined style={{ fontSize: 36, color: PRIMARY }} />
                    <div style={{ marginTop: 8 }}>
                      Kéo thả hoặc <span style={{ color: PRIMARY }}>chọn ảnh</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>JPG, PNG — tối đa 2MB</div>
                  </>
                )
              }
            </Upload.Dragger>
          </Form.Item>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item label='Tên sản phẩm' name='ten'
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}>
                <Input placeholder='Nhập tên sản phẩm' />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label='Mã SKU' name='sku'
                rules={[{ required: true, message: 'Vui lòng nhập mã SKU' }]}>
                <Input disabled={!!editItem} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label='Danh mục' name='danhMuc'
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                <Select placeholder='Chọn danh mục'
                  options={DANH_MUC_OPTIONS.map(d => ({ value: d, label: d }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='Đơn vị tính' name='donVi'
                rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}>
                <Select placeholder='Chọn đơn vị'
                  options={DON_VI_OPTIONS.map(d => ({ value: d, label: d }))} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label='Giá nhập (₫)' name='giaNhap'
                rules={[{ required: true, message: 'Vui lòng nhập giá nhập' }, { type: 'number', min: 1, message: 'Giá phải lớn hơn 0' }]}>
                <InputNumber style={{ width: '100%' }} min={1} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} placeholder='0' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='Giá xuất (₫)' name='giaXuat'
                rules={[{ required: true, message: 'Vui lòng nhập giá xuất' }, { type: 'number', min: 1, message: 'Giá phải lớn hơn 0' }]}>
                <InputNumber style={{ width: '100%' }} min={1} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} placeholder='0' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label='Số lượng tồn kho' name='tonKho'
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }, { type: 'number', min: 0, message: 'Số lượng không âm' }]}>
                <InputNumber style={{ width: '100%' }} min={0} placeholder='0' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='Ngưỡng cảnh báo' name='nguongCanhBao'
                rules={[{ required: true, message: 'Vui lòng nhập ngưỡng' }, { type: 'number', min: 1, message: 'Ngưỡng phải lớn hơn 0' }]}>
                <InputNumber style={{ width: '100%' }} min={1} placeholder='20' />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label='Mô tả' name='moTa'>
            <Input.TextArea rows={3} placeholder='Mô tả sản phẩm (không bắt buộc)' />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Delete Confirm Modal ───────────────────────────────────────────── */}
      <Modal
        open={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        footer={[
          <Button key='cancel' onClick={() => setDeleteOpen(false)}>Huỷ</Button>,
          <Button key='delete' danger type='primary' loading={loading} onClick={handleDelete}>
            Xác nhận xoá
          </Button>
        ]}
        title={
          <Space>
            <span style={{ color: '#ff4d4f', fontSize: 18 }}>⚠</span>
            Xác nhận xoá sản phẩm
          </Space>
        }
        width={440}
      >
        <div style={{ padding: '12px 0' }}>
          <Text>Bạn có chắc chắn muốn xoá sản phẩm </Text>
          <Text strong style={{ color: '#ff4d4f' }}>"{deleteItem?.ten}"</Text>
          <Text>?</Text>
          <div style={{ marginTop: 8 }}>
            <Text type='secondary' style={{ fontSize: 13 }}>
              Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xoá vĩnh viễn.
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default KhoHangPage
