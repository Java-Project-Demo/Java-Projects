import { useMemo } from 'react'
import { Empty, Popover, Tabs, Tag, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import type { LocationItemMini, WarehouseLocationResponse } from '@/types/api'

const { Text } = Typography
const PRIMARY = '#E8603C'
const ItemList = ({ items }: { items: LocationItemMini[] }) => (
  <div style={{ maxWidth: 260 }}>
    {items.map((it) => (
      <div key={it.id} style={{ marginBottom: 4 }}>
        <Text strong style={{ fontSize: 12 }}>
          {it.productName || `Product #${it.productId}`}
        </Text>
        <br />
        <Text type='secondary' style={{ fontSize: 11 }}>
          IMEI: <code>{it.imei}</code>
        </Text>
      </div>
    ))}
  </div>
)

interface BinPickerGridProps {
  bins: WarehouseLocationResponse[]
  selectedProductId?: number
  value?: number
  disableConflictCheck?: boolean
  onChange?: (id: number) => void
  compact?: boolean
}
const BinPickerGrid = ({
  bins,
  disableConflictCheck,
  selectedProductId,
  value,
  onChange,
  compact
}: BinPickerGridProps) => {
  const { t } = useTranslation('warehouse')

  const grouped = useMemo(() => {
    const g: Record<string, Record<string, WarehouseLocationResponse[]>> = {}
    bins.forEach((l) => {
      const z = l.zoneName ?? 'NO_ZONE'
      const r = l.rowNum ?? 'NO_ROW'
      g[z] ??= {}
      g[z][r] ??= []
      g[z][r].push(l)
    })
    return g
  }, [bins])

  if (bins.length === 0) {
    return <Empty description={t('binPicker.noBin')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  const renderBin = (b: WarehouseLocationResponse) => {
    const isSelected = value === b.id
    const isFull = b.items.length >= b.capacity
    const isEmpty = b.items.length === 0
    const isConflict =
      !disableConflictCheck &&
      !isEmpty &&
      selectedProductId != null &&
      b.items.some((i) => i.productId !== selectedProductId)
    const isDisabled = isFull || isConflict
    const label = `S${b.shelfNum}-B${b.binNum}`

    const button = (
      <button
        key={b.id}
        type='button'
        disabled={isDisabled}
        onClick={() => !isDisabled && onChange?.(b.id)}
        style={{
          minWidth: compact ? 56 : 68,
          padding: compact ? '4px 6px' : '6px 8px',
          borderRadius: 6,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          background: isSelected ? PRIMARY : isDisabled ? '#fff1f0' : isEmpty ? '#f6ffed' : '#fff7e6',
          color: isSelected ? '#fff' : isDisabled ? '#cf1322' : isEmpty ? '#389e0d' : '#d46b08',
          border: `1px solid ${isSelected ? PRIMARY : isDisabled ? '#ffa39e' : isEmpty ? '#b7eb8f' : '#ffd591'}`,
          fontFamily: 'monospace',
          fontSize: compact ? 10 : 11,
          fontWeight: isSelected ? 700 : 500,
          transition: 'all 0.15s',
          whiteSpace: 'nowrap'
        }}
      >
        {label}
        {!isEmpty && (
          <span
            style={{
              marginLeft: 3,
              padding: '0 4px',
              borderRadius: 8,
              background: isSelected ? '#fff' : isDisabled ? '#cf1322' : '#d46b08',
              color: isSelected ? PRIMARY : '#fff',
              fontSize: 9,
              fontWeight: 700
            }}
          >
            {b.items.length}/{b.capacity}
          </span>
        )}
      </button>
    )

    if (!isEmpty) {
      return (
        <Popover
          key={b.id}
          placement='top'
          title={
            <span>
              {label}
              {isConflict && (
                <Tag color='red' style={{ marginLeft: 6, fontSize: 10 }}>
                  {t('binPicker.conflict')}
                </Tag>
              )}
              {isFull && (
                <Tag color='volcano' style={{ marginLeft: 6, fontSize: 10 }}>
                  {t('binPicker.full')}
                </Tag>
              )}
            </span>
          }
          content={<ItemList items={b.items} />}
        >
          {button}
        </Popover>
      )
    }
    return button
  }

  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Tag color='green'>{t('binPicker.legendAvailable')}</Tag>
        <Tag color='orange'>{t('binPicker.legendOccupied')}</Tag>
        <Tag color='red'>{t('binPicker.legendFull')}</Tag>
        <Tag color='red'>{t('binPicker.legendConflict')}</Tag>
        <Tag style={{ background: PRIMARY, color: '#fff', border: 'none' }}>{t('binPicker.legendSelected')}</Tag>
      </div>
      <Tabs
        size='small'
        items={Object.entries(grouped).map(([zone, rows]) => ({
          key: zone,
          label: t('binPicker.zoneTab', { zone }),
          children: (
            <div style={{ maxHeight: 280, overflow: 'auto' }}>
              {Object.entries(rows).map(([row, rowBins]) => (
                <div key={row} style={{ marginBottom: 10 }}>
                  <Text type='secondary' style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>
                    {t('binPicker.rowLabel', { row })}
                  </Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {rowBins
                      .sort((a, b) => Number(a.shelfNum) - Number(b.shelfNum) || Number(a.binNum) - Number(b.binNum))
                      .map(renderBin)}
                  </div>
                </div>
              ))}
            </div>
          )
        }))}
      />
    </div>
  )
}

export default BinPickerGrid
