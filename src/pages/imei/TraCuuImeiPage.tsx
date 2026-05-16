import { useState } from 'react'
import {
  Button, Card, Col, Descriptions, Input, Row, Space, Tag, Timeline, Typography,
} from 'antd'
import {
  SearchOutlined, BarcodeOutlined, ShoppingOutlined,
  SafetyCertificateOutlined, UserOutlined, InboxOutlined,
} from '@ant-design/icons'
import { Trans, useTranslation } from 'react-i18next'
import PageHeader from '@/components/shared/PageHeader'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay'
import { useLazyTraceImeiQuery } from '@/features/dashboard/dashboardApi'
import { useLocaleFormat } from '@/utils/useLocaleFormat'
import type { ItemStatus } from '@/types/api'

const { Title, Text } = Typography
const PRIMARY = '#E8603C'

const STATUS_COLORS: Record<ItemStatus, string> = {
  AVAILABLE: 'green',
  SOLD: 'blue',
  DAMAGED: 'red',
  RETURNED: 'orange',
}

interface TraceResult {
  itemInfo?: { imei: string; status: ItemStatus; importDate: string | null }
  productInfo?: { name: string; sku: string; warrantyPeriod: number | null }
  saleInfo?: { customer?: { fullName: string; phoneNumber: string }; saleDate: string; salePrice: number; paymentMethod: string }
  warrantyHistory?: Array<{ id: number; issueDescription: string; status: string; receivedDate: string; returnDate: string | null }>
}

const TraCuuImeiPage = () => {
  const { t } = useTranslation(['imei', 'common'])
  const { date } = useLocaleFormat()
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
  const statusColor = itemStatus ? STATUS_COLORS[itemStatus] : undefined
  const statusLabel = itemStatus ? t(`common:status.item.${itemStatus}`, { defaultValue: itemStatus }) : ''

  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, maxWidth: 600 }}>
          <Input
            size='large' prefix={<BarcodeOutlined style={{ color: '#ccc' }} />}
            placeholder={t('input.placeholder')}
            value={imeiQuery} onChange={(e) => setImeiQuery(e.target.value)}
            onPressEnter={handleSearch} allowClear
          />
          <Button type='primary' size='large' icon={<SearchOutlined />} loading={isLoading || isFetching} onClick={handleSearch}>
            {t('input.submit')}
          </Button>
        </div>
      </Card>

      {!submitted && (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#ccc' }}>
          <BarcodeOutlined style={{ fontSize: 64, display: 'block', marginBottom: 16 }} />
          <Text type='secondary' style={{ fontSize: 16 }}>{t('intro')}</Text>
        </div>
      )}

      {submitted && isError && (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
          <InboxOutlined style={{ fontSize: 48, color: '#faad14', display: 'block', marginBottom: 12 }} />
          <Title level={5}><Trans i18nKey='notFound.title' ns='imei' values={{ imei: submitted }} components={[<code key='0' />]} /></Title>
          <Text type='secondary'>{t('notFound.description')}</Text>
        </Card>
      )}

      {submitted && result && !isError && (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', background: statusColor ? `${statusColor === 'green' ? '#f6ffed' : statusColor === 'blue' ? '#e6f4ff' : '#fff7e6'}` : '#fafafa' }}>
              <Space size={24} wrap>
                <div>
                  <Text type='secondary' style={{ fontSize: 12 }}>{t('overview.imei')}</Text>
                  <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700 }}>{result.itemInfo?.imei ?? submitted}</div>
                </div>
                {statusColor && (
                  <div>
                    <Text type='secondary' style={{ fontSize: 12 }}>{t('overview.status')}</Text>
                    <div><Tag color={statusColor} style={{ fontSize: 14, padding: '2px 12px' }}>{statusLabel}</Tag></div>
                  </div>
                )}
                {result.productInfo && (
                  <div>
                    <Text type='secondary' style={{ fontSize: 12 }}>{t('overview.product')}</Text>
                    <div style={{ fontWeight: 600 }}>{result.productInfo.name}</div>
                    <Text type='secondary' style={{ fontSize: 12 }}>{result.productInfo.sku}</Text>
                  </div>
                )}
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title={<Space><ShoppingOutlined style={{ color: PRIMARY }} /><span>{t('product.title')}</span></Space>}
              style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              {result.productInfo ? (
                <Descriptions column={1} size='small'>
                  <Descriptions.Item label={t('product.name')}>{result.productInfo.name}</Descriptions.Item>
                  <Descriptions.Item label={t('product.sku')}>{result.productInfo.sku}</Descriptions.Item>
                  <Descriptions.Item label={t('product.warrantyPeriod')}>{result.productInfo.warrantyPeriod ?? '—'} {t('common:common.months')}</Descriptions.Item>
                  <Descriptions.Item label={t('product.importDate')}>
                    {date(result.itemInfo?.importDate)}
                  </Descriptions.Item>
                </Descriptions>
              ) : <Text type='secondary'>{t('product.empty')}</Text>}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title={<Space><UserOutlined style={{ color: '#1677ff' }} /><span>{t('sale.title')}</span></Space>}
              style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              {result.saleInfo && Object.keys(result.saleInfo).length > 0 ? (
                <Descriptions column={1} size='small'>
                  {result.saleInfo.customer && (
                    <>
                      <Descriptions.Item label={t('sale.customer')}>{result.saleInfo.customer.fullName}</Descriptions.Item>
                      <Descriptions.Item label={t('sale.phone')}>{result.saleInfo.customer.phoneNumber}</Descriptions.Item>
                    </>
                  )}
                  <Descriptions.Item label={t('sale.saleDate')}>
                    {date(result.saleInfo.saleDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('sale.salePrice')}>
                    <CurrencyDisplay value={result.saleInfo.salePrice} color={PRIMARY} />
                  </Descriptions.Item>
                  <Descriptions.Item label={t('sale.paymentMethod')}>
                    {t(`common:status.payment.${result.saleInfo.paymentMethod}`, { defaultValue: result.saleInfo.paymentMethod })}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#ccc' }}>
                  <InboxOutlined style={{ fontSize: 32, display: 'block', marginBottom: 8 }} />
                  <Text type='secondary'>{t('sale.empty')}</Text>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24}>
            <Card title={<Space><SafetyCertificateOutlined style={{ color: '#52c41a' }} /><span>{t('warranty.title')}</span></Space>}
              style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              {result.warrantyHistory && result.warrantyHistory.length > 0 ? (
                <Timeline
                  items={result.warrantyHistory.map((w) => ({
                    color: w.status === 'FIXED' ? 'green' : w.status === 'UNFIXABLE' ? 'red' : 'blue',
                    children: (
                      <div>
                        <div style={{ fontWeight: 600 }}>{w.issueDescription}</div>
                        <Space size={12}>
                          <Tag>{t(`common:status.warranty.${w.status}`, { defaultValue: w.status })}</Tag>
                          <Text type='secondary' style={{ fontSize: 12 }}>
                            {t('warranty.received')}: {date(w.receivedDate)}
                          </Text>
                          {w.returnDate && (
                            <Text type='secondary' style={{ fontSize: 12 }}>
                              {t('warranty.returned')}: {date(w.returnDate)}
                            </Text>
                          )}
                        </Space>
                      </div>
                    ),
                  }))}
                />
              ) : (
                <Text type='secondary'>{t('warranty.empty')}</Text>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}

export default TraCuuImeiPage
