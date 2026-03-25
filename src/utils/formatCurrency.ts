const CURRENCY_FORMATTER = new Intl.NumberFormat(undefined, {
  currency: 'VND',
  style: 'currency',
  currencyDisplay: 'narrowSymbol'
})

export const formatCurrency = (number: number) => {
  const formatted = CURRENCY_FORMATTER.format(number)

  return formatted.replace(/^(\D+)(.+)$/, '$2 $1').trim()
}
