import { useState } from 'react'
import { Breadcrumb, Button, Card, Checkbox, Col, Input, InputNumber, message, Row, Space, Table, Tag, Typography } from 'antd'
import { HomeOutlined, PrinterOutlined, BarcodeOutlined, ClearOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
const PRIMARY = '#E8603C'

interface SanPham { id: string; sku: string; ten: string; danhMuc: string; donVi: string; tonKho: number }

const PRODUCTS: SanPham[] = [
  { id: '1',  sku: 'SP-10001', ten: 'Máy khoan điện Bosch GSB 550',         danhMuc: 'Dụng cụ',        donVi: 'Cái', tonKho: 45  },
  { id: '2',  sku: 'SP-10002', ten: 'Laptop Dell XPS 15 9530',               danhMuc: 'Điện tử',        donVi: 'Cái', tonKho: 12  },
  { id: '3',  sku: 'SP-10003', ten: 'Máy bơm nước Panasonic GP-200JXK',     danhMuc: 'Cơ khí',         donVi: 'Cái', tonKho: 8   },
  { id: '4',  sku: 'SP-10004', ten: 'Bút bi Thiên Long RT-007',              danhMuc: 'Văn phòng phẩm', donVi: 'Hộp', tonKho: 150 },
  { id: '5',  sku: 'SP-10005', ten: 'Máy đo huyết áp Omron HEM-7120',       danhMuc: 'Thiết bị y tế',  donVi: 'Cái', tonKho: 0   },
  { id: '6',  sku: 'SP-10006', ten: 'Động cơ điện 3 pha 5.5kW',             danhMuc: 'Cơ khí',         donVi: 'Cái', tonKho: 25  },
  { id: '7',  sku: 'SP-10007', ten: 'Màn hình Samsung 24" F24T350',          danhMuc: 'Điện tử',        donVi: 'Cái', tonKho: 18  },
  { id: '8',  sku: 'SP-10008', ten: 'Giấy A4 Double A 80gsm',                danhMuc: 'Văn phòng phẩm', donVi: 'Hộp', tonKho: 200 },
  { id: '9',  sku: 'SP-10009', ten: 'Kẹp giấy bướm 51mm Deli',              danhMuc: 'Văn phòng phẩm', donVi: 'Hộp', tonKho: 80  },
  { id: '10', sku: 'SP-10010', ten: 'Máy hàn điện Riland ARC-200',           danhMuc: 'Dụng cụ',        donVi: 'Cái', tonKho: 15  },
  { id: '11', sku: 'SP-10011', ten: 'Ống nghe y tế 3M Littmann Classic III', danhMuc: 'Thiết bị y tế',  donVi: 'Cái', tonKho: 0   },
  { id: '12', sku: 'SP-10012', ten: 'Điện thoại Samsung Galaxy S24',          danhMuc: 'Điện tử',        donVi: 'Cái', tonKho: 30  },
]

interface BarcodeCardProps {
  sku: string; ten: string; donVi: string; copies: number
}

const BarcodeCard = ({ sku, ten, donVi, copies }: BarcodeCardProps) => (
  <div style={{
    border: '1px solid #e5e5e5', borderRadius: 10, padding: '16px 20px',
    background: '#fff', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: '#999', letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' }}>
        Warehouse Management System
      </div>
      {/* Barcode visual */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 1, marginBottom: 8 }}>
        {sku.split('').map((_, i) => (
          <div key={i} style={{ width: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1, height: 40, background: '#222', borderRadius: 1 }} />
        ))}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 800, letterSpacing: 4, color: '#111', marginBottom: 4 }}>
        {sku}
      </div>
      <div style={{ fontSize: 11, color: '#555', marginBottom: 4, maxWidth: 200, margin: '0 auto 4px' }}>{ten}</div>
      <div style={{ fontSize: 10, color: '#888' }}>ĐVT: {donVi}</div>
    </div>
    {copies > 1 && (
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <Tag color='blue' style={{ fontSize: 10 }}>x{copies} bản in</Tag>
      </div>
    )}
  </div>
)

const InBarcodePage = () => {
  const [search, setSearch] = useState('')
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([])
  const [copies, setCopies] = useState<Record<string, number>>({})

  const filtered = PRODUCTS.filter(p =>
    !search || p.ten.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  )

  const selectedProducts = PRODUCTS.filter(p => selectedKeys.includes(p.id))

  const getCopies = (id: string) => copies[id] ?? 1

  const handlePrint = () => {
    if (selectedProducts.length === 0) { message.warning('Vui lòng chọn ít nhất 1 sản phẩm để in!'); return }
    message.success(`Đang in ${selectedProducts.length} barcode (tổng ${selectedProducts.reduce((s, p) => s + getCopies(p.id), 0)} bản)...`)
    setTimeout(() => window.print(), 300)
  }

  const columns: ColumnsType<SanPham> = [
    { title: 'Mã SKU', dataIndex: 'sku', key: 'sku', width: 110,
      render: v => <Text style={{ fontFamily: 'monospace', fontWeight: 700 }}>{v}</Text> },
    { title: 'Tên sản phẩm', dataIndex: 'ten', key: 'ten', ellipsis: true },
    { title: 'Danh mục', dataIndex: 'danhMuc', key: 'dm', width: 140, render: v => <Tag>{v}</Tag> },
    { title: 'ĐVT', dataIndex: 'donVi', key: 'dv', width: 70 },
    { title: 'Tồn kho', dataIndex: 'tonKho', key: 'tk', width: 80, align: 'center',
      render: v => <Text style={{ color: v === 0 ? '#ff4d4f' : v < 20 ? '#faad14' : '#52c41a', fontWeight: 600 }}>{v}</Text> },
    { title: 'Số bản in', key: 'copies', width: 100, align: 'center',
      render: (_, r) => (
        <InputNumber
          min={1} max={99} size='small' style={{ width: 70 }}
          value={getCopies(r.id)}
          onChange={v => setCopies(prev => ({ ...prev, [r.id]: v ?? 1 }))}
          disabled={!selectedKeys.includes(r.id)}
        />
      )
    }
  ]

  return (
    <div>
      <Breadcrumb className='mb-4' items={[{ title: <HomeOutlined />, href: '/' }, { title: 'In Barcode' }]} />

      <Row gutter={[20, 20]}>
        {/* Left: Product Selection */}
        <Col xs={24} lg={14}>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
            title={<Space><BarcodeOutlined style={{ color: PRIMARY }} /><span>Chọn sản phẩm để in</span></Space>}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <Input.Search placeholder='Tìm sản phẩm...' value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ flex: 1 }} />
              {selectedKeys.length > 0 && (
                <Button icon={<ClearOutlined />} onClick={() => setSelectedKeys([])}>Bỏ chọn tất cả</Button>
              )}
            </div>
            <Table
              rowKey='id' size='small' bordered
              dataSource={filtered}
              columns={columns}
              rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
              pagination={{ pageSize: 8, showTotal: t => `${t} sản phẩm` }}
            />
          </Card>
        </Col>

        {/* Right: Preview + Print */}
        <Col xs={24} lg={10}>
          <Card
            style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', position: 'sticky', top: 80 }}
            title={<Space><PrinterOutlined style={{ color: PRIMARY }} /><span>Xem trước barcode</span></Space>}
            extra={
              <Button type='primary' icon={<PrinterOutlined />} onClick={handlePrint} disabled={selectedKeys.length === 0}>
                In {selectedKeys.length > 0 ? `(${selectedKeys.length})` : ''}
              </Button>
            }
          >
            {selectedProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#bbb' }}>
                <BarcodeOutlined style={{ fontSize: 48, marginBottom: 12, display: 'block' }} />
                <Text type='secondary'>Chọn sản phẩm ở bảng bên trái để xem trước barcode</Text>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 12, padding: '8px 12px', background: '#f6ffed', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13 }}>
                    <Text strong style={{ color: PRIMARY }}>{selectedProducts.length}</Text> sản phẩm —&nbsp;
                    <Text strong style={{ color: '#52c41a' }}>{selectedProducts.reduce((s, p) => s + getCopies(p.id), 0)}</Text> bản in
                  </Text>
                  <Space>
                    <Checkbox onChange={e => {
                      if (e.target.checked) setCopies(prev => Object.fromEntries(selectedProducts.map(p => [p.id, prev[p.id] ?? 1])))
                    }}>Đặt tất cả x</Checkbox>
                    <InputNumber size='small' min={1} max={99} defaultValue={1} style={{ width: 55 }}
                      onChange={v => setCopies(Object.fromEntries(selectedProducts.map(p => [p.id, v ?? 1])))} />
                  </Space>
                </div>
                <div style={{ maxHeight: 520, overflowY: 'auto', paddingRight: 4 }}>
                  {selectedProducts.map(p => (
                    <BarcodeCard key={p.id} sku={p.sku} ten={p.ten} donVi={p.donVi} copies={getCopies(p.id)} />
                  ))}
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default InBarcodePage
