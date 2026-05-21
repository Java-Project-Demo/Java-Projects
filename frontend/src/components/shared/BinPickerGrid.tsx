import { useMemo } from 'react'
import { Empty, Popover, Tabs, Tag, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import type { LocationItemMini, WarehouseLocationResponse, WarehouseResponse } from '@/types/api'

const { Text } = Typography
const PRIMARY = '#E8603C'

const ItemList = ({ items }: { items: LocationItemMini[] }) => (
  <div style={{ maxWidth: 260 }}>
    {items.map((it) => (
      <div key={it.id} style={{ marginBottom: 4 }}>
        <Text strong style={{ fontSize: 12 }}>{it.productName || `Product #${it.productId}`}</Text>
        <br />
        <Text type='secondary' style={{ fontSize: 11 }}>
          IMEI: <code>{it.imei}</code>
        </Text>
      </div>
    ))}
  </div>
)

interface BinPickerGridProps {
  warehouse: WarehouseResponse | null
  availableIds: Set<number>
  value?: number
  onChange?: (id: number) => void
  compact?: boolean
}

const BinPickerGrid = ({ warehouse, availableIds, value, onChange, compact }: BinPickerGridProps) => {
  const { t } = useTranslation('warehouse')

  const grouped = useMemo(() => {
    if (!warehouse) return {}
    const g: Record<string, Record<string, WarehouseLocationResponse[]>> = {}
    warehouse.locations.forEach((l) => {
      const z = l.zoneName ?? 'NO_ZONE'
      const r = l.rowNum ?? 'NO_ROW'
      g[z] ??= {}
      g[z][r] ??= []
      g[z][r].push(l)
    })
    return g
  }, [warehouse])

  if (!warehouse) {
    return <Empty description={t('binPicker.selectWarehouse')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }
  if (warehouse.locations.length === 0) {
    return <Empty description={t('binPicker.noBin')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  const renderBin = (b: WarehouseLocationResponse) => {
    const isAvailable = availableIds.has(b.id)
    const isSelected = value === b.id
    const itemCount = b.items?.length ?? 0
    const label = `S${b.shelfNum}-B${b.binNum}`
    const button = (
      <button
        key={b.id}
        type='button'
        disabled={!isAvailable}
        onClick={() => isAvailable && onChange?.(b.id)}
        style={{
          minWidth: compact ? 56 : 68,
          padding: compact ? '4px 6px' : '6px 8px',
          borderRadius: 6,
          cursor: isAvailable ? 'pointer' : 'not-allowed',
          background: isSelected ? PRIMARY : isAvailable ? '#f6ffed' : '#fff1f0',
          color: isSelected ? '#fff' : isAvailable ? '#389e0d' : '#cf1322',
          border: `1px solid ${isSelected ? PRIMARY : isAvailable ? '#b7eb8f' : '#ffa39e'}`,
          fontFamily: 'monospace',
          fontSize: compact ? 10 : 11,
          fontWeight: isSelected ? 700 : 500,
          transition: 'all 0.15s',
          position: 'relative',
        }}
        title={isAvailable
          ? t('binPicker.binTooltipAvailable', { label })
          : t('binPicker.binTooltipOccupied', { label, count: itemCount })}
      >
        {label}
        {itemCount > 0 && (
          <span style={{
            marginLeft: 4, padding: '0 4px', borderRadius: 8,
            background: isSelected ? '#fff' : '#cf1322', color: isSelected ? PRIMARY : '#fff',
            fontSize: 9, fontWeight: 700,
          }}>{itemCount}</span>
        )}
      </button>
    )
    if (itemCount > 0) {
      return (
        <Popover key={b.id} content={<ItemList items={b.items} />} title={t('binPicker.binPopoverTitle', { label })} placement='top'>
          {button}
        </Popover>
      )
    }
    return button
  }

  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 12 }}>
        <Tag color='green'>{t('binPicker.legendAvailable')}</Tag>
        <Tag color='red'>{t('binPicker.legendOccupied')}</Tag>
        <Tag color='orange'>{t('binPicker.legendSelected')}</Tag>
      </div>
      <Tabs
        size='small'
        items={Object.entries(grouped).map(([zone, rows]) => ({
          key: zone,
          label: t('binPicker.zoneTab', { zone }),
          children: (
            <div style={{ maxHeight: 280, overflow: 'auto' }}>
              {Object.entries(rows).map(([row, bins]) => (
                <div key={row} style={{ marginBottom: 10 }}>
                  <Text type='secondary' style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>
                    {t('binPicker.rowLabel', { row })}
                  </Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {bins
                      .sort(
                        (a, b) =>
                          Number(a.shelfNum) - Number(b.shelfNum) || Number(a.binNum) - Number(b.binNum),
                      )
                      .map(renderBin)}
                  </div>
                </div>
              ))}
            </div>
          ),
        }))}
      />
    </div>
  )
}

export default BinPickerGrid
