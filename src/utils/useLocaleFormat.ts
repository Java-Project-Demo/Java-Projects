import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const useLocaleFormat = () => {
  const { i18n } = useTranslation()
  const code = (i18n.resolvedLanguage ?? i18n.language ?? 'vi').slice(0, 2)

  return useMemo(() => {
    const localeTag = code === 'en' ? 'en-US' : 'vi-VN'
    return {
      localeTag,
      date: (v: string | null | undefined) => (v ? new Date(v).toLocaleDateString(localeTag) : '—'),
      dateTime: (v: string | null | undefined) => (v ? new Date(v).toLocaleString(localeTag) : '—'),
      time: (v: string | null | undefined) =>
        v ? new Date(v).toLocaleTimeString(localeTag, { hour: '2-digit', minute: '2-digit' }) : '—',
      currency: (v: number | null | undefined) =>
        (v ?? 0).toLocaleString(localeTag, { style: 'currency', currency: 'VND' })
    }
  }, [code])
}
