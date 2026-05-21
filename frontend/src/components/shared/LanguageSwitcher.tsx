import { Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { LANGUAGE_KEY, type SupportedLanguage } from '@/i18n'

interface LangOption {
  code: SupportedLanguage
  flag: string
  shortLabel: string
  labelKey: string
}

const LANGUAGES: LangOption[] = [
  { code: 'vi', flag: '🇻🇳', shortLabel: 'VI', labelKey: 'language.vi' },
  { code: 'en', flag: '🇬🇧', shortLabel: 'EN', labelKey: 'language.en' }
]

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation('common')
  const currentCode = (i18n.resolvedLanguage ?? i18n.language ?? 'vi').slice(0, 2) as SupportedLanguage
  const current = LANGUAGES.find((l) => l.code === currentCode) ?? LANGUAGES[0]

  const items: MenuProps['items'] = LANGUAGES.map((lang) => ({
    key: lang.code,
    label: (
      <span className='flex items-center gap-2'>
        <span style={{ fontSize: 16 }}>{lang.flag}</span>
        <span>{t(lang.labelKey)}</span>
      </span>
    )
  }))

  const handleSelect: MenuProps['onClick'] = ({ key }) => {
    void i18n.changeLanguage(key)
    localStorage.setItem(LANGUAGE_KEY, key)
  }

  return (
    <Dropdown menu={{ items, onClick: handleSelect, selectedKeys: [current.code] }} placement='bottomRight'>
      <Button
        type='text'
        icon={<GlobalOutlined style={{ color: '#fff' }} />}
        style={{ color: '#fff' }}
        aria-label={t('language.label')}
      >
        <span style={{ marginLeft: 4 }}>
          {current.flag} {current.shortLabel}
        </span>
      </Button>
    </Dropdown>
  )
}

export default LanguageSwitcher
