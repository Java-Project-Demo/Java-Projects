import { useState } from 'react'
import { Breadcrumb, Card, Col, DatePicker, Row, Select, Space, Statistic, Table, Tag, Typography } from 'antd'
import { HomeOutlined, ArrowUpOutlined, ArrowDownOutlined, ImportOutlined, ExportOutlined, ShoppingOutlined, DollarOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const PRIMARY = '#E8603C'

const cardStyle = { borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', height: '100%' }

const MONTHLY_DATA = [
  { thang: 'T10/2023', nhap: 320, xuat: 210, ton: 850 },
  { thang: 'T11/2023', nhap: 280, xuat: 195, ton: 935 },
  { thang: 'T12/2023', nhap: 450, xuat: 380, ton: 1005 },
  { thang: 'T1/2024',  nhap: 190, xuat: 150, ton: 1045 },
  { thang: 'T2/2024',  nhap: 310, xuat: 260, ton: 1095 },
  { thang: 'T3/2024',  nhap: 625, xuat: 450, ton: 1270 },
]

const DANH_MUC_DATA = [
  { danhMuc: 'Điện tử',         soSP: 6,  giaTriKho: 125400000, nhapThang: 3,  xuatThang: 8  },
  { danhMuc: 'Dụng cụ',         soSP: 7,  giaTriKho: 28650000,  nhapThang: 10, xuatThang: 6  },
  { danhMuc: 'Cơ khí',          soSP: 4,  giaTriKho: 62500000,  nhapThang: 5,  xuatThang: 3  },
  { danhMuc: 'Thiết bị y tế',   soSP: 4,  giaTriKho: 19800000,  nhapThang: 8,  xuatThang: 12 },
  { danhMuc: 'Văn phòng phẩm',  soSP: 5,  giaTriKho: 5250000,   nhapThang: 25, xuatThang: 30 },
]

const TOP_NHAP = [
  { key: '1', ten: 'Máy khoan Bosch GSB 550',  soLuong: 50, tongTien: 60000000,  nguonCung: 'Cty Bosch VN' },
  { key: '2', ten: 'Giấy A4 Double A 80gsm',   soLuong: 200, tongTien: 17000000, nguonCung: 'Cty Double A' },
  { key: '3', ten: 'Bình xịt cồn 500ml',       soLuong: 90, tongTien: 3150000,   nguonCung: 'Cty Y tế Xanh' },
  { key: '4', ten: 'Dao mổ y tế hộp 100c',     soLuong: 55, tongTien: 9900000,   nguonCung: 'Cty Pharmedic' },
  { key: '5', ten: 'Kéo cắt đa năng Stanley',  soLuong: 120, tongTien: 5400000,  nguonCung: 'Cty Stanley VN' },
]

const TOP_XUAT = [
  { key: '1', ten: 'Bút bi Thiên Long RT-007',  soLuong: 200, tongTien: 5000000,   khachHang: 'Trường THPT Nguyễn Trãi' },
  { key: '2', ten: 'Laptop Dell XPS 15',         soLuong: 6,   tongTien: 168000000, khachHang: 'Ngân hàng Vietcombank' },
  { key: '3', ten: 'Dao mổ y tế hộp 100c',       soLuong: 20,  tongTien: 5600000,   khachHang: 'Bệnh viện Chợ Rẫy' },
  { key: '4', ten: 'Bình xịt cồn 500ml',         soLuong: 30,  tongTien: 1650000,   khachHang: 'Trạm Y tế Phường 5' },
  { key: '5', ten: 'Thước kẹp Mitutoyo 150mm',   soLuong: 3,   tongTien: 1650000,   khachHang: 'Xưởng cơ khí Đông Nam' },
]

const fmtCurrency = (v: number) => v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
const maxVal = (arr: number[]) => Math.max(...arr)

const BarChart = ({ data, maxV }: { data: { label: string; nhap: number; xuat: number }[]; maxV: number }) => (
  <div style={{ padding: '8px 0' }}>
    {data.map((d, i) => (
      <div key={i} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: 500 }}>{d.label}</Text>
          <Space size={12}>
            <Text style={{ fontSize: 11, color: '#52c41a' }}>↓ {d.nhap}</Text>
            <Text style={{ fontSize: 11, color: '#1677ff' }}>↑ {d.xuat}</Text>
          </Space>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 10, color: '#888', width: 30 }}>Nhập</Text>
            <div style={{ flex: 1, height: 10, background: '#f5f5f5', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ width: `${(d.nhap / maxV) * 100}%`, height: '100%', background: '#52c41a', borderRadius: 5, transition: 'width 0.5s ease' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 10, color: '#888', width: 30 }}>Xuất</Text>
            <div style={{ flex: 1, height: 10, background: '#f5f5f5', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ width: `${(d.xuat / maxV) * 100}%`, height: '100%', background: '#1677ff', borderRadius: 5, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

const ThongKePage = () => {
  const [period, setPeriod] = useState('thang_nay')

  const totalGiaTriKho = DANH_MUC_DATA.reduce((s, d) => s + d.giaTriKho, 0)
  const totalNhap = MONTHLY_DATA[MONTHLY_DATA.length - 1].nhap
  const totalXuat = MONTHLY_DATA[MONTHLY_DATA.length - 1].xuat
  const chartMax = maxVal(MONTHLY_DATA.map(d => Math.max(d.nhap, d.xuat)))

  const nhapColumns: ColumnsType<typeof TOP_NHAP[0]> = [
    { title: '#', key: 'stt', width: 40, render: (_, __, i) => <Text type='secondary'>{i + 1}</Text> },
    { title: 'Sản phẩm', dataIndex: 'ten', key: 'ten', ellipsis: true },
    { title: 'Số lượng', dataIndex: 'soLuong', key: 'sl', width: 90, align: 'center' },
    { title: 'Tổng tiền', dataIndex: 'tongTien', key: 'tt', width: 140, render: fmtCurrency },
    { title: 'Nhà cung cấp', dataIndex: 'nguonCung', key: 'nc', ellipsis: true },
  ]

  const xuatColumns: ColumnsType<typeof TOP_XUAT[0]> = [
    { title: '#', key: 'stt', width: 40, render: (_, __, i) => <Text type='secondary'>{i + 1}</Text> },
    { title: 'Sản phẩm', dataIndex: 'ten', key: 'ten', ellipsis: true },
    { title: 'Số lượng', dataIndex: 'soLuong', key: 'sl', width: 90, align: 'center' },
    { title: 'Doanh thu', dataIndex: 'tongTien', key: 'tt', width: 140, render: fmtCurrency },
    { title: 'Khách hàng', dataIndex: 'khachHang', key: 'kh', ellipsis: true },
  ]

  return (
    <div>
      <Breadcrumb className='mb-4' items={[{ title: <HomeOutlined />, href: '/' }, { title: 'Thống kê' }]} />

      {/* Filters */}
      <Card style={{ ...cardStyle, marginBottom: 20 }}>
        <Space wrap>
          <Select value={period} onChange={setPeriod} style={{ width: 160 }}
            options={[{ value: 'thang_nay', label: 'Tháng này' }, { value: 'quy_nay', label: 'Quý này' }, { value: 'nam_nay', label: 'Năm nay' }, { value: 'tuy_chon', label: 'Tuỳ chọn' }]} />
          {period === 'tuy_chon' && <RangePicker />}
        </Space>
      </Card>

      {/* KPI */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {[
          { title: 'Tổng giá trị kho', value: totalGiaTriKho, icon: <DollarOutlined />, color: PRIMARY, fmt: true, trend: '+8.2%' },
          { title: 'Tổng nhập tháng',  value: totalNhap,       icon: <ImportOutlined />, color: '#52c41a', fmt: false, trend: '+12%' },
          { title: 'Tổng xuất tháng',  value: totalXuat,       icon: <ExportOutlined />, color: '#1677ff', fmt: false, trend: '+8%' },
          { title: 'Tổng sản phẩm',    value: 20,              icon: <ShoppingOutlined />, color: '#faad14', fmt: false, trend: '+5%' },
        ].map((k, i) => (
          <Col xs={24} sm={12} xl={6} key={i}>
            <Card style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type='secondary' style={{ fontSize: 12 }}>{k.title}</Text>
                  <Statistic
                    value={k.value}
                    formatter={k.fmt ? (v => fmtCurrency(Number(v))) : undefined}
                    valueStyle={{ fontSize: 22, fontWeight: 700, color: k.color }}
                  />
                  <Space size={4} style={{ marginTop: 4 }}>
                    <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 11 }} />
                    <Text style={{ fontSize: 11, color: '#52c41a' }}>{k.trend}</Text>
                  </Space>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${k.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: k.color }}>
                  {k.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* Monthly Chart */}
        <Col xs={24} lg={14}>
          <Card style={cardStyle} title='Biến động nhập/xuất kho 6 tháng gần nhất'>
            <BarChart
              data={MONTHLY_DATA.map(d => ({ label: d.thang, nhap: d.nhap, xuat: d.xuat }))}
              maxV={chartMax}
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 8 }}>
              <Space size={6}><div style={{ width: 12, height: 12, borderRadius: 3, background: '#52c41a' }} /><Text style={{ fontSize: 12 }}>Nhập kho</Text></Space>
              <Space size={6}><div style={{ width: 12, height: 12, borderRadius: 3, background: '#1677ff' }} /><Text style={{ fontSize: 12 }}>Xuất kho</Text></Space>
            </div>
          </Card>
        </Col>

        {/* Category Distribution */}
        <Col xs={24} lg={10}>
          <Card style={cardStyle} title='Phân bổ giá trị kho theo danh mục'>
            {DANH_MUC_DATA.map((d, i) => {
              const pct = Math.round((d.giaTriKho / totalGiaTriKho) * 100)
              const colors = [PRIMARY, '#1677ff', '#52c41a', '#faad14', '#722ed1']
              return (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13 }}>{d.danhMuc}</Text>
                    <Space size={8}>
                      <Text style={{ fontSize: 12, color: '#888' }}>{pct}%</Text>
                      <Text style={{ fontSize: 12, fontWeight: 600 }}>{fmtCurrency(d.giaTriKho)}</Text>
                    </Space>
                  </div>
                  <div style={{ height: 12, background: '#f5f5f5', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: colors[i], borderRadius: 6, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              )
            })}
            <div style={{ marginTop: 16, padding: '12px', background: '#fafafa', borderRadius: 8, textAlign: 'center' }}>
              <Text type='secondary' style={{ fontSize: 12 }}>Tổng giá trị kho: </Text>
              <Text strong style={{ color: PRIMARY }}>{fmtCurrency(totalGiaTriKho)}</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Category Stats Table */}
        <Col xs={24}>
          <Card style={cardStyle} title='Thống kê theo danh mục'>
            <Table
              rowKey='danhMuc' size='middle' bordered pagination={false}
              dataSource={DANH_MUC_DATA}
              columns={[
                { title: 'Danh mục', dataIndex: 'danhMuc', key: 'dm', render: v => <Tag>{v}</Tag> },
                { title: 'Số sản phẩm', dataIndex: 'soSP', key: 'sp', align: 'center', render: v => <Text strong>{v}</Text> },
                { title: 'Giá trị kho', dataIndex: 'giaTriKho', key: 'gtk', render: fmtCurrency },
                { title: 'Nhập tháng này', dataIndex: 'nhapThang', key: 'nth', align: 'center',
                  render: v => <Space><ArrowDownOutlined style={{ color: '#52c41a' }} /><Text style={{ color: '#52c41a' }}>{v}</Text></Space> },
                { title: 'Xuất tháng này', dataIndex: 'xuatThang', key: 'xth', align: 'center',
                  render: v => <Space><ArrowUpOutlined style={{ color: '#1677ff' }} /><Text style={{ color: '#1677ff' }}>{v}</Text></Space> },
                { title: '% Giá trị', key: 'pct', align: 'center',
                  render: (_, r) => {
                    const pct = Math.round((r.giaTriKho / totalGiaTriKho) * 100)
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 8, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: PRIMARY, borderRadius: 4 }} />
                        </div>
                        <Text style={{ fontSize: 12, width: 32 }}>{pct}%</Text>
                      </div>
                    )
                  }
                },
              ]}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}><Text strong>Tổng cộng</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align='center'><Text strong>{DANH_MUC_DATA.reduce((s, d) => s + d.soSP, 0)}</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={2}><Text strong>{fmtCurrency(totalGiaTriKho)}</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align='center'><Text strong style={{ color: '#52c41a' }}>{DANH_MUC_DATA.reduce((s, d) => s + d.nhapThang, 0)}</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align='center'><Text strong style={{ color: '#1677ff' }}>{DANH_MUC_DATA.reduce((s, d) => s + d.xuatThang, 0)}</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={5} />
                </Table.Summary.Row>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card style={cardStyle} title={<Space><ImportOutlined style={{ color: '#52c41a' }} />Top 5 nhập kho nhiều nhất</Space>}>
            <Table rowKey='key' size='small' pagination={false} dataSource={TOP_NHAP} columns={nhapColumns} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card style={cardStyle} title={<Space><ExportOutlined style={{ color: '#1677ff' }} />Top 5 xuất kho nhiều nhất</Space>}>
            <Table rowKey='key' size='small' pagination={false} dataSource={TOP_XUAT} columns={xuatColumns} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ThongKePage
