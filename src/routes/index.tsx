import { useRoutes } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import PrivateRoute from './PrivateRoute'
import PublicRoute from './PublicRoute'
import Home from '@/pages/Home'
import LoginPage from '@/pages/auth/LoginPage'
import DanhMucVatTuPage from '@/pages/warehouse/DanhMucVatTuPage'
import XuatKhoPage from '@/pages/warehouse/XuatKhoPage'
import NhapKhoPage from '@/pages/warehouse/NhapKhoPage'
import ThongKePage from '@/pages/warehouse/ThongKePage'
import NhanVienPage from '@/pages/warehouse/NhanVienPage'
import YeuCauPage from '@/pages/warehouse/YeuCauPage'
import KhoHangPage from '@/pages/warehouse/KhoHangPage'
import InBarcodePage from '@/pages/warehouse/InBarcodePage'

const AppRoutes = () => {
  return useRoutes([
    {
      element: <PrivateRoute />,
      children: [
        {
          element: <MainLayout />,
          children: [
            { path: '/',               element: <Home /> },
            { path: '/danh-muc-vat-tu', element: <DanhMucVatTuPage /> },
            { path: '/xuat-kho',        element: <XuatKhoPage /> },
            { path: '/nhap-kho',        element: <NhapKhoPage /> },
            { path: '/thong-ke',        element: <ThongKePage /> },
            { path: '/nhan-vien',       element: <NhanVienPage /> },
            { path: '/yeu-cau',         element: <YeuCauPage /> },
            { path: '/vat-tu',          element: <KhoHangPage /> },
            { path: '/in-barcode',      element: <InBarcodePage /> },
          ]
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
