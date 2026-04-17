import { useState } from 'react'
import {
  Breadcrumb,
  Button,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography
} from 'antd'
import { HomeOutlined, PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

// ─── Types ───────────────────────────────────────────────────────────────────

type TrangThai = 'cho_nhap' | 'da_nhap' | 'da_huy'

interface NhapKhoRecord {
  id: string
  maNhapHang: string
  tenVatTu: string
  nhaCungCap: string
  trangThai: TrangThai
  thoiGianNhap: string
}

interface ChiTietSanPham {
  id: string
  maSanPham: string
  tenSanPham: string
  soLuong: number
  donViTinh: string
  donGia: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_LIST: NhapKhoRecord[] = [
  { id: '1', maNhapHang: 'NK12345678', tenVatTu: 'Bộ vi', nhaCungCap: 'Công ty Pharmedic', trangThai: 'da_nhap', thoiGianNhap: '2021-02-05 08:26:36' },
  { id: '2', maNhapHang: 'NK23456789', tenVatTu: 'Bộ vit', nhaCungCap: 'Công ty Pharmedic', trangThai: 'da_nhap', thoiGianNhap: '2021-02-05 09:44:33' },
  { id: '3', maNhapHang: 'NK34567890', tenVatTu: 'Máy bơm', nhaCungCap: 'Công ty Pharmedic', trangThai: 'da_nhap', thoiGianNhap: '2021-02-02 19:17:15' },
  { id: '4', maNhapHang: 'NK45678901', tenVatTu: 'Máy cắt', nhaCungCap: 'Công ty Pharmedic', trangThai: 'cho_nhap', thoiGianNhap: '2021-02-01 11:22:46' },
  { id: '5', maNhapHang: 'NK56789012', tenVatTu: 'Máy hàn', nhaCungCap: 'Công ty Pharmedic', trangThai: 'da_nhap', thoiGianNhap: '2021-02-02 07:57:01' },
  { id: '6', maNhapHang: 'NK67890123', tenVatTu: 'Máy hàn 2', nhaCungCap: 'Công ty Pharmedic', trangThai: 'cho_nhap', thoiGianNhap: '2021-02-02 01:51:34' },
  { id: '7', maNhapHang: 'NK78901234', tenVatTu: 'Xe xúc lật', nhaCungCap: 'Công ty Pharmedic', trangThai: 'da_huy', thoiGianNhap: '2021-02-01 02:18:11' },
  { id: '8', maNhapHang: 'NK89012345', tenVatTu: 'Xe xúc lật 2', nhaCungCap: 'Công ty Pharmedic', trangThai: 'da_nhap', thoiGianNhap: '2021-01-11 00:33:02' }
]

const MOCK_CHI_TIET: ChiTietSanPham[] = [
  { id: '1', maSanPham: '123456789123', tenSanPham: 'Máy khoan Apple 15 pro max - 123456789123', soLuong: 10, donViTinh: 'Cái', donGia: 24050000 },
  { id: '2', maSanPham: '123456789123', tenSanPham: 'Máy khoan Apple 15 pro max - 123456789123', soLuong: 10, donViTinh: 'Cái', donGia: 24050000 },
  { id: '3', maSanPham: '123456789123', tenSanPham: 'Máy khoan Apple 15 pro max - 123456789123', soLuong: 10, donViTinh: 'Km', donGia: 24050000 },
  { id: '4', maSanPham: '123456789123', tenSanPham: 'Máy khoan Apple 15 pro max - 123456789123', soLuong: 10, donViTinh: 'M²', donGia: 24050000 },
  { id: '5', maSanPham: '123456789123', tenSanPham: 'Máy khoan Apple 15 pro max - 123456789123', soLuong: 10, donViTinh: 'Cái', donGia: 24050000 }
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const trangThaiLabel: Record<TrangThai, { label: string; color: string }> = {
  cho_nhap: { label: 'Chờ nhập hàng', color: 'gold' },
  da_nhap: { label: 'Đã nhập hàng', color: 'orange' },
  da_huy: { label: 'Đã huỷ', color: 'red' }
}

const formatCurrency = (val: number) =>
  val.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

// ─── Component ────────────────────────────────────────────────────────────────

const NhapKhoPage = () => {
  const [data, setData] = useState<NhapKhoRecord[]>(MOCK_LIST)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<TrangThai | undefined>()

  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<NhapKhoRecord | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<ChiTietSanPham | null>(null)
  const [editForm] = Form.useForm()

  const [confirmImportOpen, setConfirmImportOpen] = useState(false)
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)
  const [actionTarget, setActionTarget] = useState<NhapKhoRecord | null>(null)

  // ── Filters ────────────────────────────────────────────────────────────────
  const filtered = data.filter((r) => {
    const matchSearch =
      !search ||
      r.maNhapHang.toLowerCase().includes(search.toLowerCase()) ||
      r.tenVatTu.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || r.trangThai === filterStatus
    return matchSearch && matchStatus
  })

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleNhapKho = (record: NhapKhoRecord) => {
    setActionTarget(record)
    setConfirmImportOpen(true)
  }

  const handleHuyBo = (record: NhapKhoRecord) => {
    setActionTarget(record)
    setConfirmCancelOpen(true)
  }

  const handleHoatLai = (record: NhapKhoRecord) => {
    setData((prev) => prev.map((r) => (r.id === record.id ? { ...r, trangThai: 'cho_nhap' } : r)))
  }

  const confirmImport = () => {
    if (!actionTarget) return
    setData((prev) => prev.map((r) => (r.id === actionTarget.id ? { ...r, trangThai: 'da_nhap' } : r)))
    setConfirmImportOpen(false)
    if (selectedRecord?.id === actionTarget.id) {
      setSelectedRecord((prev) => prev && { ...prev, trangThai: 'da_nhap' })
    }
  }

  const confirmCancel = () => {
    if (!actionTarget) return
    setData((prev) => prev.map((r) => (r.id === actionTarget.id ? { ...r, trangThai: 'da_huy' } : r)))
    setConfirmCancelOpen(false)
    if (selectedRecord?.id === actionTarget.id) {
      setSelectedRecord((prev) => prev && { ...prev, trangThai: 'da_huy' })
    }
  }

  // ── Main table columns ─────────────────────────────────────────────────────
  const columns: ColumnsType<NhapKhoRecord> = [
    { title: 'STT', key: 'stt', width: 60, render: (_, __, idx) => idx + 1 },
    { title: 'Mã nhập hàng', dataIndex: 'maNhapHang', key: 'maNhapHang' },
    { title: 'Tên vật tư', dataIndex: 'tenVatTu', key: 'tenVatTu' },
    { title: 'Nhà cung cấp', dataIndex: 'nhaCungCap', key: 'nhaCungCap' },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (val: TrangThai) => (
        <Tag color={trangThaiLabel[val].color}>{trangThaiLabel[val].label}</Tag>
      )
    },
    { title: 'Thời gian nhập', dataIndex: 'thoiGianNhap', key: 'thoiGianNhap' },
    {
      title: 'Hành động',
      key: 'action',
      width: 260,
      render: (_, record) => (
        <Space size={4} split={<Text type='secondary'>|</Text>}>
          {record.trangThai === 'cho_nhap' && (
            <Button type='link' size='small' onClick={() => handleNhapKho(record)}>
              Nhập kho
            </Button>
          )}
          <Button
            type='link'
            size='small'
            onClick={() => { setSelectedRecord(record); setDetailOpen(true) }}
          >
            Chi tiết
          </Button>
          {record.trangThai === 'cho_nhap' && (
            <Button type='link' size='small' danger onClick={() => handleHuyBo(record)}>
              Huỷ bỏ
            </Button>
          )}
          {record.trangThai === 'da_huy' && (
            <Button type='link' size='small' onClick={() => handleHoatLai(record)}>
              Hoạt lại
            </Button>
          )}
        </Space>
      )
    }
  ]

  // ── Detail product table columns ───────────────────────────────────────────
  const chiTietColumns: ColumnsType<ChiTietSanPham> = [
    { title: 'STT', key: 'stt', width: 55, render: (_, __, idx) => idx + 1 },
    { title: 'Mã sản phẩm', dataIndex: 'maSanPham', key: 'maSanPham', width: 140 },
    { title: 'Tên sản phẩm', dataIndex: 'tenSanPham', key: 'tenSanPham' },
    { title: 'Số lượng', dataIndex: 'soLuong', key: 'soLuong', width: 90 },
    { title: 'Đơn vị tính', dataIndex: 'donViTinh', key: 'donViTinh', width: 110 },
    { title: 'Đơn giá', dataIndex: 'donGia', key: 'donGia', width: 140, render: (v) => formatCurrency(v) },
    {
      title: 'Tiền',
      key: 'tien',
      width: 140,
      render: (_, r) => formatCurrency(r.soLuong * r.donGia)
    },
    {
      title: '',
      key: 'edit',
      width: 100,
      render: (_, record) =>
        selectedRecord?.trangThai === 'cho_nhap' ? (
          <Space>
            <Button
              type='link'
              size='small'
              onClick={() => {
                setEditItem(record)
                editForm.setFieldsValue({ soLuong: record.soLuong, ghiChu: '' })
                setEditOpen(true)
              }}
            >
              Sửa
            </Button>
            <Button type='link' size='small' danger>
              Xóa
            </Button>
          </Space>
        ) : null
    }
  ]

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        className='mb-4'
        items={[
          { title: <HomeOutlined />, href: '/' },
          { title: 'Nhập kho vật tư' }
        ]}
      />

      <div className='bg-white rounded-lg p-6 shadow-sm'>
        {/* Header row */}
        <div className='flex items-center justify-between mb-4'>
          <Title level={4} className='!mb-0'>
            Nhập kho vật tư
          </Title>
          <Button type='primary' icon={<PlusOutlined />}>
            Tạo phiếu nhập
          </Button>
        </div>

        {/* Filters */}
        <div className='flex gap-3 mb-4'>
          <Input.Search
            placeholder='Tìm mã nhập hàng, tên vật tư...'
            style={{ width: 280 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <Select
            placeholder='Trạng thái'
            style={{ width: 180 }}
            allowClear
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'cho_nhap', label: 'Chờ nhập hàng' },
              { value: 'da_nhap', label: 'Đã nhập hàng' },
              { value: 'da_huy', label: 'Đã huỷ' }
            ]}
          />
          <DatePicker placeholder='Ngày nhập hàng' />
        </div>

        {/* Table */}
        <Table
          rowKey='id'
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `1-${Math.min(10, t)} of ${t} items` }}
          bordered
          size='middle'
        />
      </div>

      {/* ── Detail Drawer ────────────────────────────────────────────────────── */}
      <Drawer
        title='Chi tiết nhập kho'
        width={900}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        extra={
          selectedRecord?.trangThai === 'cho_nhap' && (
            <Button
              type='primary'
              onClick={() => { setActionTarget(selectedRecord); setConfirmImportOpen(true) }}
            >
              Nhập kho
            </Button>
          )
        }
      >
        {selectedRecord && (
          <>
            <Descriptions bordered column={2} size='small' className='mb-6'>
              <Descriptions.Item label='Mã số nhập hàng'>{selectedRecord.maNhapHang}</Descriptions.Item>
              <Descriptions.Item label='Trạng thái'>
                <Tag color={trangThaiLabel[selectedRecord.trangThai].color}>
                  {trangThaiLabel[selectedRecord.trangThai].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label='Thời gian'>{selectedRecord.thoiGianNhap}</Descriptions.Item>
              <Descriptions.Item label='Đơn chú'>—</Descriptions.Item>
              <Descriptions.Item label='Nhà cung cấp'>{selectedRecord.nhaCungCap}</Descriptions.Item>
              <Descriptions.Item label='Người nhập kho'>Nhân viên kho 1</Descriptions.Item>
            </Descriptions>

            <Table
              rowKey='id'
              columns={chiTietColumns}
              dataSource={MOCK_CHI_TIET}
              pagination={false}
              bordered
              size='small'
              summary={(rows) => {
                const total = rows.reduce((s, r) => s + r.soLuong * r.donGia, 0)
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={6}>
                      <Text strong>Tổng cộng</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong>{formatCurrency(total)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} />
                  </Table.Summary.Row>
                )
              }}
            />
          </>
        )}
      </Drawer>

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      <Modal
        title='Chỉnh sửa vật tư yêu cầu'
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        footer={[
          <Button key='cancel' onClick={() => setEditOpen(false)}>Huỷ</Button>,
          <Button key='submit' type='primary' onClick={() => { editForm.submit(); setEditOpen(false) }}>
            Cập nhật
          </Button>
        ]}
        width={480}
      >
        <Form form={editForm} layout='vertical' className='mt-4'>
          <Form.Item label='Tên sản phẩm' name='tenSanPham'>
            <Select
              placeholder='Máy khoan 10 phiên'
              defaultValue={editItem?.tenSanPham}
              options={MOCK_CHI_TIET.map((i) => ({ value: i.id, label: i.tenSanPham }))}
            />
          </Form.Item>
          <Form.Item label='Số lượng' name='soLuong'>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label='Ghi chú' name='ghiChu'>
            <Input.TextArea rows={3} placeholder='Mua để phục vụ công việc ABC...' />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Confirm Import Modal ─────────────────────────────────────────────── */}
      <Modal
        title='Lưu ý'
        open={confirmImportOpen}
        onCancel={() => setConfirmImportOpen(false)}
        footer={[
          <Button key='cancel' onClick={() => setConfirmImportOpen(false)}>Huỷ</Button>,
          <Button key='confirm' type='primary' onClick={confirmImport}>
            Nhập kho
          </Button>
        ]}
      >
        <Text>Bạn có chắc nhập kho cho đơn nhập hàng này?</Text>
      </Modal>

      {/* ── Confirm Cancel Modal ─────────────────────────────────────────────── */}
      <Modal
        title='Lưu ý'
        open={confirmCancelOpen}
        onCancel={() => setConfirmCancelOpen(false)}
        footer={[
          <Button key='cancel' onClick={() => setConfirmCancelOpen(false)}>Huỷ</Button>,
          <Button key='confirm' danger type='primary' onClick={confirmCancel}>
            Huỷ bỏ
          </Button>
        ]}
      >
        <Text>Bạn có chắc muốn huỷ đơn nhập hàng này?</Text>
      </Modal>
    </div>
  )
}

export default NhapKhoPage
