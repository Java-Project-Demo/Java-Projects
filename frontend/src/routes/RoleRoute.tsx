import type { ReactNode } from 'react'
import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@/app/hooks'
import type { URole } from '@/config/rolePermissions'

interface RoleRouteProps {
  allowedRoles: URole[]
  children: ReactNode
}

const RoleRoute = ({ allowedRoles, children }: RoleRouteProps) => {
  const user = useAppSelector((s) => s.auth.user)
  const navigate = useNavigate()
  const { t } = useTranslation('common')

  if (!user || !(allowedRoles as string[]).includes(user.role)) {
    return (
      <Result
        status='403'
        title={t('forbidden.title')}
        subTitle={t('forbidden.subtitle')}
        extra={
          <Button type='primary' onClick={() => navigate('/')}>
            {t('forbidden.backHome')}
          </Button>
        }
      />
    )
  }
  return <>{children}</>
}

export default RoleRoute
