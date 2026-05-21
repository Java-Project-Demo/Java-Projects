import type { ReactNode } from 'react'
import { Breadcrumb, Typography } from 'antd'
import type { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb'
import { HomeOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumb?: Partial<BreadcrumbItemType>[]
  extra?: ReactNode
}

const PageHeader = ({ title, subtitle, breadcrumb, extra }: PageHeaderProps) => {
  const items: Partial<BreadcrumbItemType>[] = [
    { title: <HomeOutlined />, href: '/' },
    ...(breadcrumb ?? [{ title }]),
  ]

  return (
    <div style={{ marginBottom: 20 }}>
      <Breadcrumb style={{ marginBottom: 8 }} items={items} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>{title}</Title>
          {subtitle && <Text type='secondary' style={{ fontSize: 13 }}>{subtitle}</Text>}
        </div>
        {extra && <div>{extra}</div>}
      </div>
    </div>
  )
}

export default PageHeader
