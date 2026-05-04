import { useState } from 'react'
import {
  Button, Card, Col, Descriptions, Input, Row, Space, Tag, Timeline, Typography,
} from 'antd'
import {
  SearchOutlined, BarcodeOutlined, ShoppingOutlined,
  SafetyCertificateOutlined, UserOutlined, InboxOutlined,
} from '@ant-design/icons'
import PageHeader from '@/components/shared/PageHeader'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay'
import { useLazyTraceImeiQuery } from '@/features/dashboard/dashboardApi'
import type { ItemStatus } from '@/types/api'

const { Title, Text } = Typography
const PRIMARY = '#E8603C'

const ITEM_STATUS_CONFIG: Record<ItemStatus, { label: string; color: string }> = {
  AVAILABLE: { label: 'Còn trong kho', color: 'green' },
  SOLD:      { label: 'Đã bán',         color: 'blue' },
  DAMAGED:   { label: 'Hỏng',           color: 'red' },
  RETURNED:  { label: 'Đã trả lại',     color: 'orange' },
}

interface TraceResult {
  itemInfo?: { imei: string; status: ItemStatus; importDate: string | null }
  productInfo?: { name: string; sku: string; warrantyPeriod: number | null }
  saleInfo?: { customer?: { fullName: string; phoneNumber: string }; saleDate: string; salePrice: number; paymentMethod: string }
  warrantyHistory?: Array<{ id: number; issueDescription: string; status: string; receivedDate: string; returnDate: string | null }>
}

const TraCuuImeiPage = () => {
  const [imeiQuery, setImeiQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [triggerTrace, { data, isLoading, isError, isFetching }] = useLazyTraceImeiQuery()

  const result = data as TraceResult | undefined

  const handleSearch = () => {
    const v = imeiQuery.trim()
    if (!v) return
    setSubmitted(v)
    void triggerTrace(v)
  }

  const itemStatus = result?.itemInfo?.status
  const statusCfg = itemStatus ? ITEM_STATUS_CONFIG[itemStatus] : undefined

  return (
    <div>
      <PageHeader title='Tra cứu IMEI' subtitle='Theo dõi toàn bộ lịch sử của một thiết bị theo mã IMEI' />

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, maxWidth: 600 }}>
          <Input
            size='large' prefix={<BarcodeOutlined style={{ color: '#ccc' }} />}
            placeholder='Nhập mã IMEI để tra cứu...'
            value={imeiQuery} onChange={(e) => setImeiQuery(e.target.value)}
            onPressEnter={handleSearch} allowClear
          />
          <Button type='primary' size='large' icon={<SearchOutlined />} loading={isLoading || isFetching} onClick={handleSearch}>
            Tra cứu
          </Button>
        </div>
      </Card>

      {!submitted && (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#ccc' }}>
          <BarcodeOutlined style={{ fontSize: 64, display: 'block', marginBottom: 16 }} />
          <Text type='secondary' style={{ fontSize: 16 }}>Nhập IMEI để xem thông tin thiết bị</Text>
        </div>
      )}

      {submitted && isError && (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
          <InboxOutlined style={{ fontSize: 48, color: '#faad14', display: 'block', marginBottom: 12 }} />
          <Title level={5}>Không tìm thấy IMEI: <code>{submitted}</code></Title>
          <Text type='secondary'>IMEI này chưa được đăng ký trong hệ thống</Text>
        </Card>
      )}

      {submitted && result && !isError && (
        <Row gutter={[16, 16]}>
          {/* Trạng thái tổng quan */}
          <Col xs={24}>
            <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', background: statusCfg ? `${statusCfg.color === 'green' ? '#f6ffed' : statusCfg.color === 'blue' ? '#e6f4ff' : '#fff7e6'}` : '#fafafa' }}>
              <Space size={24} wrap>
                <div>
                  <Text type='secondary' style={{ fontSize: 12 }}>IMEI</Text>
                  <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700 }}>{result.itemInfo?.imei ?? submitted}</div>
                </div>
                {statusCfg && (
                  <div>
                    <Text type='secondary' style={{ fontSize: 12 }}>Trạng thái</Text>
                    <div><Tag color={statusCfg.color} style={{ fontSize: 14, padding: '2px 12px' }}>{statusCfg.label}</Tag></div>
                  </div>
                )}
                {result.productInfo && (
                  <div>
                    <Text type='secondary' style={{ fontSize: 12 }}>Sản phẩm</Text>
                    <div style={{ fontWeight: 600 }}>{result.productInfo.name}</div>
                    <Text type='secondary' style={{ fontSize: 12 }}>{result.productInfo.sku}</Text>
                  </div>
                )}
              </Space>
            </Card>
          </Col>

          {/* Thông tin sản phẩm & item */}
          <Col xs={24} lg={12}>
            <Card title={<Space><ShoppingOutlined style={{ color: PRIMARY }} /><span>Thông tin sản phẩm</span></Space>}
              style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              {result.productInfo ? (
                <Descriptions column={1} size='small'>
                  <Descriptions.Item label='Tên sản phẩm'>{result.productInfo.name}</Descriptions.Item>
                  <Descriptions.Item label='SKU'>{result.productInfo.sku}</Descriptions.Item>
                  <Descriptions.Item label='Thời hạn BH'>{result.productInfo.warrantyPeriod ?? '—'} tháng</Descriptions.Item>
                  <Descriptions.Item label='Ngày nhập kho'>
                    {result.itemInfo?.importDate ? new Date(result.itemInfo.importDate).toLocaleDateString('vi-VN') : '—'}
                  </Descriptions.Item>
                </Descriptions>
              ) : <Text type='secondary'>Không có thông tin sản phẩm</Text>}
            </Card>
          </Col>

          {/* Thông tin bán hàng */}
          <Col xs={24} lg={12}>
            <Card title={<Space><UserOutlined style={{ color: '#1677ff' }} /><span>Thông tin bán hàng</span></Space>}
              style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              {result.saleInfo && Object.keys(result.saleInfo).length > 0 ? (
                <Descriptions column={1} size='small'>
                  {result.saleInfo.customer && (
                    <>
                      <Descriptions.Item label='Khách hàng'>{result.saleInfo.customer.fullName}</Descriptions.Item>
                      <Descriptions.Item label='SĐT'>{result.saleInfo.customer.phoneNumber}</Descriptions.Item>
                    </>
                  )}
                  <Descriptions.Item label='Ngày bán'>
                    {result.saleInfo.saleDate ? new Date(result.saleInfo.saleDate).toLocaleDateString('vi-VN') : '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label='Giá bán'>
                    <CurrencyDisplay value={result.saleInfo.salePrice} color={PRIMARY} />
                  </Descriptions.Item>
                  <Descriptions.Item label='Thanh toán'>{result.saleInfo.paymentMethod}</Descriptions.Item>
                </Descriptions>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#ccc' }}>
                  <InboxOutlined style={{ fontSize: 32, display: 'block', marginBottom: 8 }} />
                  <Text type='secondary'>Chưa được bán</Text>
                </div>
              )}
            </Card>
          </Col>

          {/* Lịch sử bảo hành */}
          <Col xs={24}>
            <Card title={<Space><SafetyCertificateOutlined style={{ color: '#52c41a' }} /><span>Lịch sử bảo hành</span></Space>}
              style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              {result.warrantyHistory && result.warrantyHistory.length > 0 ? (
                <Timeline
                  items={result.warrantyHistory.map((w) => ({
                    color: w.status === 'FIXED' ? 'green' : w.status === 'UNFIXABLE' ? 'red' : 'blue',
                    children: (
                      <div>
                        <div style={{ fontWeight: 600 }}>{w.issueDescription}</div>
                        <Space size={12}>
                          <Tag>{w.status}</Tag>
                          <Text type='secondary' style={{ fontSize: 12 }}>
                            Nhận: {new Date(w.receivedDate).toLocaleDateString('vi-VN')}
                          </Text>
                          {w.returnDate && (
                            <Text type='secondary' style={{ fontSize: 12 }}>
                              Trả: {new Date(w.returnDate).toLocaleDateString('vi-VN')}
                            </Text>
                          )}
                        </Space>
                      </div>
                    ),
                  }))}
                />
              ) : (
                <Text type='secondary'>Chưa có lịch sử bảo hành</Text>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}

export default TraCuuImeiPage
