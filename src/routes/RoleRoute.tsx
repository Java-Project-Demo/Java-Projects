import type { ReactNode } from 'react'
import { Result } from 'antd'
import { useAppSelector } from '@/app/hooks'

interface RoleRouteProps {
  allowedRoles: string[]
  children: ReactNode
}

const RoleRoute = ({ allowedRoles, children }: RoleRouteProps) => {
  const user = useAppSelector((s) => s.auth.user)
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <Result
        status='403'
        title='Không có quyền truy cập'
        subTitle='Bạn không có quyền xem trang này. Vui lòng liên hệ quản trị viên.'
      />
    )
  }
  return <>{children}</>
}

export default RoleRoute
