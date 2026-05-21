import { useAppSelector } from '@/app/hooks'
import { ACTION_ROLES, type ActionKey, type URole } from '@/config/rolePermissions'

export const hasRole = (userRole: string | undefined, allowed: readonly URole[]): boolean =>
  !!userRole && (allowed as readonly string[]).includes(userRole)

export const useRole = (): URole | undefined => {
  const role = useAppSelector((s) => s.auth.user?.role)
  return role as URole | undefined
}

export const useHasRole = (allowed: readonly URole[]): boolean => {
  const role = useRole()
  return hasRole(role, allowed)
}

export const useCan = (action: ActionKey): boolean => {
  const role = useRole()
  return hasRole(role, ACTION_ROLES[action])
}

export const useIsAdmin = (): boolean => useHasRole(['ADMIN'])
