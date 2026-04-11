import { useRoutes } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import PrivateRoute from './PrivateRoute'
import PublicRoute from './PublicRoute'
import Home from '@/pages/Home'
import LoginPage from '@/pages/auth/LoginPage'

const AppRoutes = () => {
  return useRoutes([
    {
      element: <PrivateRoute />,
      children: [
        {
          element: <MainLayout />,
          children: [{ path: '/', element: <Home /> }]
        }
      ]
    },
    {
      element: <PublicRoute />,
      children: [
        {
          element: <AuthLayout />,
          children: [{ path: '/login', element: <LoginPage /> }]
        }
      ]
    }
  ])
}

export default AppRoutes
