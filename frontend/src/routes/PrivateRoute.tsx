import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { clearCredentials } from '@/features/auth/authSlice'
import { useEffect } from 'react'
import { TOKEN_KEY } from '@/config/axios'
import { decodeJwt } from '@/features/auth/types'

const PrivateRoute = () => {
  const { isAuthenticated, user, mustChangePassword } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return
    const decoded = decodeJwt(token)
    if (!decoded) {
      dispatch(clearCredentials())
      return
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        dispatch(clearCredentials())
      }
    } catch { /* ignore */ }
  }, [dispatch])

  if (!isAuthenticated || !user) return <Navigate to='/login' replace />
  if (mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to='/change-password' replace />
  }
  return <Outlet />
}

export default PrivateRoute
