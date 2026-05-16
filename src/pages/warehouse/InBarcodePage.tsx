import { useState, useMemo } from 'react'
import { App, Breadcrumb, Button, Card, Checkbox, Col, Input, InputNumber, Row, Space, Table, Tag, Typography } from 'antd'
import { HomeOutlined, PrinterOutlined, BarcodeOutlined, ClearOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import { useGetProductsQuery } from '@/features/product/productApi'
import { useGetCategoriesQuery } from '@/features/category/categoryApi'
import type { Product } from '@/types/api'

const { Title, Text } = Typography
const PRIMARY = '#E8603C'

interface PrintItem { product: Product; copies: number }

const BarcodePreview = ({ sku, name, copies, copyLabel, headerLabel }: { sku: string; name: string; copies: number; copyLabel: string; headerLabel: string }) => (
  <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, padding: '16px 20px', background: '#fff', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: '#999', letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' }}>
        {headerLabel}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 1, marginBottom: 8 }}>
        {sku.split('').map((_, i) => (
          <div key={i} style={{ width: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1, height: 40, background: '#222', borderRadius: 1 }} />
        ))}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 800, letterSpacing: 4, color: '#111', marginBottom: 4 }}>{sku}</div>
      <div style={{ fontSize: 11, color: '#555', marginBottom: 4, maxWidth: 200, margin: '0 auto 4px' }}>{name}</div>
    </div>
    {copies > 1 && <div style={{ textAlign: 'center', marginTop: 8 }}><Tag color='blue' style={{ fontSize: 10 }}>{copyLabel}</Tag></div>}
  </div>
)

const InBarcodePage = () => {
  const { message } = App.useApp()
  const { t } = useTranslation(['product', 'menu', 'common'])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [copies, setCopies] = useState<Record<number, number>>({})

  const { data: products = [], isLoading } = useGetProductsQuery()
  const { data: categories = [] } = useGetCategoriesQuery()

  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories])

  const filtered = useMemo(
    () => products.filter((p) =>
      !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    ),
    [products, search],
  )

  const printItems: PrintItem[] = products
    .filter((p) => selected.has(p.id))
    .map((p) => ({ product: p, copies: copies[p.id] ?? 1 }))

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handlePrint = () => {
    if (printItems.length === 0) { void message.warning(t('barcode.printWarning')); return }
    window.print()
    void message.success(t('barcode.printing', { count: printItems.length }))
  }

  const columns: ColumnsType<Product> = [
    {
      title: '', key: 'check', width: 50,
      render: (_, r) => (
        <Checkbox checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} />
      ),
    },
    {
      title: t('barcode.colProduct'), key: 'name',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
          <Text type='secondary' style={{ fontSize: 12, fontFamily: 'monospace' }}>{r.sku}</Text>
        </div>
      ),
    },
    {
      title: t('barcode.colCategory'), dataIndex: 'categoryId', key: 'cat', width: 130,
      render: (v: number) => <Tag>{catMap[v] ?? `#${v}`}</Tag>,
    },
    {
      title: t('barcode.colStock'), dataIndex: 'currentStock', key: 'stock', width: 90, align: 'center' as const,
      render: (v: number) => v,
    },
    {
      title: t('barcode.colCopies'), key: 'copies', width: 110,
      render: (_, r) => (
        <InputNumber min={1} max={100} size='small'
          value={copies[r.id] ?? 1}
          onChange={(v) => setCopies((prev) => ({ ...prev, [r.id]: v ?? 1 }))}
          disabled={!selected.has(r.id)}
          style={{ width: 80 }}
        />
      ),
    },
  ]

  const totalCopies = printItems.reduce((s, i) => s + i.copies, 0)

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}
        items={[{ href: '/', title: <HomeOutlined /> }, { title: t('menu:item.printBarcode') }]} />

      <Title level={4} style={{ marginBottom: 20 }}>
        <BarcodeOutlined style={{ color: PRIMARY, marginRight: 8 }} />{t('barcode.title')}
      </Title>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
          <Card
            style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
            title={t('barcode.selectCard', { count: selected.size })}
            extra={
              <Space>
                {selected.size > 0 && (
                  <Button size='small' icon={<ClearOutlined />} onClick={() => setSelected(new Set())}>{t('barcode.clearSelection')}</Button>
                )}
              </Space>
            }
          >
            <Input.Search placeholder={t('barcode.searchPlaceholder')} style={{ marginBottom: 12 }}
              value={search} onChange={(e) => setSearch(e.target.value)} allowClear />
            <Table
              rowKey='id' loading={isLoading} columns={columns} dataSource={filtered}
              size='small' pagination={{ pageSize: 10, showTotal: (total) => t('barcode.totalSuffix', { count: total }) }}
              onRow={(r) => ({ onClick: () => toggleSelect(r.id), style: { cursor: 'pointer', background: selected.has(r.id) ? '#fff7f5' : undefined } })}
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
            title={t('barcode.previewCard')}
            extra={
              <Button type='primary' icon={<PrinterOutlined />} onClick={handlePrint} disabled={printItems.length === 0}>
                {t('barcode.printButton')} {printItems.length > 0 ? t('barcode.printSuffix', { count: totalCopies }) : ''}
              </Button>
            }
          >
            {printItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <BarcodeOutlined style={{ fontSize: 48, color: '#ddd', display: 'block', marginBottom: 12 }} />
                <Text type='secondary'>{t('barcode.selectHint')}</Text>
              </div>
            ) : (
              printItems.map((item) => (
                <BarcodePreview
                  key={item.product.id}
                  sku={item.product.sku}
                  name={item.product.name}
                  copies={item.copies}
                  copyLabel={t('barcode.copies', { count: item.copies })}
                  headerLabel={t('barcode.header')}
                />
              ))
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default InBarcodePage
