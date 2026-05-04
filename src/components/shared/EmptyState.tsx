import type { ReactNode } from 'react'
import { Button, Typography } from 'antd'
import { InboxOutlined } from '@ant-design/icons'

const { Text } = Typography

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    <div style={{ fontSize: 48, color: '#ccc', marginBottom: 12 }}>
      {icon ?? <InboxOutlined />}
    </div>
    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>
    {description && <Text type='secondary' style={{ fontSize: 13 }}>{description}</Text>}
    {action && (
      <div style={{ marginTop: 16 }}>
        <Button type='primary' onClick={action.onClick}>{action.label}</Button>
      </div>
    )}
  </div>
)

export default EmptyState
