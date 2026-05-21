import { useLocaleFormat } from '@/utils/useLocaleFormat'

interface CurrencyDisplayProps {
  value: number
  color?: string
  size?: 'small' | 'default' | 'large'
}

const SIZE_MAP = { small: 13, default: 16, large: 20 }

const CurrencyDisplay = ({ value, color, size = 'default' }: CurrencyDisplayProps) => {
  const { currency } = useLocaleFormat()
  return (
    <span style={{ color, fontSize: SIZE_MAP[size], fontWeight: 600 }}>
      {currency(value ?? 0)}
    </span>
  )
}

export default CurrencyDisplay
