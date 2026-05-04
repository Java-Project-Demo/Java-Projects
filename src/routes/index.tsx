import { useRoutes } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import PrivateRoute from './PrivateRoute'
import PublicRoute from './PublicRoute'
import RoleRoute from './RoleRoute'

import Home from '@/pages/Home'
import LoginPage from '@/pages/auth/LoginPage'

// Warehouse pages
import DanhMucVatTuPage from '@/pages/warehouse/DanhMucVatTuPage'
import XuatKhoPage from '@/pages/warehouse/XuatKhoPage'
import NhapKhoPage from '@/pages/warehouse/NhapKhoPage'
import ThongKePage from '@/pages/warehouse/ThongKePage'
import NhanVienPage from '@/pages/warehouse/NhanVienPage'
import YeuCauPage from '@/pages/warehouse/YeuCauPage'
import KhoHangPage from '@/pages/warehouse/KhoHangPage'
import InBarcodePage from '@/pages/warehouse/InBarcodePage'

// New pages
import BaoHanhPage from '@/pages/warranty/BaoHanhPage'
import NhaCungCapPage from '@/pages/supplier/NhaCungCapPage'
import LichSuDonHangPage from '@/pages/order/LichSuDonHangPage'
import TraCuuImeiPage from '@/pages/imei/TraCuuImeiPage'
import TonKhoCuPage from '@/pages/report/TonKhoCuPage'

const AppRoutes = () => {
  return useRoutes([
    {
      element: <PrivateRoute />,
      children: [
        {
          element: <MainLayout />,
          children: [
            { path: '/',                  element: <Home /> },
            { path: '/vat-tu',            element: <KhoHangPage /> },
            { path: '/nhap-kho',          element: <RoleRoute allowedRoles={['ADMIN', 'STOCK']}><NhapKhoPage /></RoleRoute> },
            { path: '/xuat-kho',          element: <RoleRoute allowedRoles={['ADMIN', 'SALES']}><XuatKhoPage /></RoleRoute> },
            { path: '/danh-muc-vat-tu',   element: <DanhMucVatTuPage /> },
            { path: '/nha-cung-cap',      element: <NhaCungCapPage /> },
            { path: '/lich-su-don-hang',  element: <LichSuDonHangPage /> },
            { path: '/bao-hanh',          element: <BaoHanhPage /> },
            { path: '/yeu-cau',           element: <YeuCauPage /> },
            { path: '/tra-cuu-imei',      element: <TraCuuImeiPage /> },
            { path: '/thong-ke',          element: <RoleRoute allowedRoles={['ADMIN']}><ThongKePage /></RoleRoute> },
            { path: '/ton-kho-cu',        element: <RoleRoute allowedRoles={['ADMIN', 'STOCK']}><TonKhoCuPage /></RoleRoute> },
            { path: '/nhan-vien',         element: <RoleRoute allowedRoles={['ADMIN']}><NhanVienPage /></RoleRoute> },
            { path: '/in-barcode',        element: <InBarcodePage /> },
          ],
        },
      ],
    },
    {
      element: <PublicRoute />,
      children: [
        {
          element: <AuthLayout />,
          children: [{ path: '/login', element: <LoginPage /> }],
        },
      ],
    },
  ])
}

export default AppRoutes
