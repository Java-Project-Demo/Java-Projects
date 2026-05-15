import { useRoutes } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import PrivateRoute from './PrivateRoute'
import PublicRoute from './PublicRoute'
import RoleRoute from './RoleRoute'

import Home from '@/pages/Home'
import LoginPage from '@/pages/auth/LoginPage'
import ChangePasswordPage from '@/pages/auth/ChangePasswordPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

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
import KiemKePage from '@/pages/inventory/KiemKePage'
import QuanLyKhoPage from '@/pages/warehouse-mgmt/QuanLyKhoPage'
import AuditLogPage from '@/pages/report/AuditLogPage.tsx'

const AppRoutes = () => {
  return useRoutes([
    {
      element: <PrivateRoute />,
      children: [
        {
          element: <AuthLayout />,
          children: [{ path: '/change-password', element: <ChangePasswordPage /> }],
        },
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
            { path: '/kiem-ke',           element: <RoleRoute allowedRoles={['ADMIN', 'STOCK']}><KiemKePage /></RoleRoute> },
            { path: '/quan-ly-kho',       element: <RoleRoute allowedRoles={['ADMIN', 'STOCK']}><QuanLyKhoPage /></RoleRoute> },
            { path: '/logs',              element: <RoleRoute allowedRoles={['ADMIN']}><AuditLogPage/></RoleRoute>}
          ],
        },
      ],
    },
    {
      element: <PublicRoute />,
      children: [
        {
          element: <AuthLayout />,
          children: [
            { path: '/login',            element: <LoginPage /> },
            { path: '/forgot-password',  element: <ForgotPasswordPage /> },
            { path: '/reset-password',   element: <ResetPasswordPage /> },
          ],
        },
      ],
    },
  ])
}

export default AppRoutes
