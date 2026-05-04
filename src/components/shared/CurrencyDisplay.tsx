interface CurrencyDisplayProps {
  value: number
  color?: string
  size?: 'small' | 'default' | 'large'
}

const SIZE_MAP = { small: 13, default: 16, large: 20 }

const CurrencyDisplay = ({ value, color, size = 'default' }: CurrencyDisplayProps) => (
  <span style={{ color, fontSize: SIZE_MAP[size], fontWeight: 600 }}>
    {(value ?? 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
  </span>
)

export default CurrencyDisplay
