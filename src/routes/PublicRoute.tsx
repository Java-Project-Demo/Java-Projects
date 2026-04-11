import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

const PublicRoute = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  return isAuthenticated ? <Navigate to='/' replace /> : <Outlet />
}

export default PublicRoute
