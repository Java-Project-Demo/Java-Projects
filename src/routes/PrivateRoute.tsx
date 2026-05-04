import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { clearCredentials } from '@/features/auth/authSlice'
import { useEffect } from 'react'
import { TOKEN_KEY } from '@/config/axios'
import { decodeJwt } from '@/features/auth/types'

const PrivateRoute = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return
    const decoded = decodeJwt(token)
    if (!decoded) {
      dispatch(clearCredentials())
      return
    }
    // Check token expiry from JWT exp claim
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        dispatch(clearCredentials())
      }
    } catch { /* ignore */ }
  }, [dispatch])

  if (!isAuthenticated || !user) return <Navigate to='/login' replace />
  return <Outlet />
}

export default PrivateRoute
