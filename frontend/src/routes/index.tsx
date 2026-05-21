import type { ReactElement } from 'react'
import { useRoutes } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import PrivateRoute from './PrivateRoute'
import PublicRoute from './PublicRoute'
import RoleRoute from './RoleRoute'
import { ROUTE_ROLES } from '@/config/rolePermissions'

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

// Other domain pages
import NhaCungCapPage from '@/pages/supplier/NhaCungCapPage'
import LichSuDonHangPage from '@/pages/order/LichSuDonHangPage'
import TraCuuImeiPage from '@/pages/imei/TraCuuImeiPage'
import TonKhoCuPage from '@/pages/report/TonKhoCuPage'
import QuanLyKhoPage from '@/pages/warehouse-mgmt/QuanLyKhoPage'
import AuditLogPage from '@/pages/report/AuditLogPage.tsx'

const guard = (path: keyof typeof ROUTE_ROLES, element: ReactElement) => (
  <RoleRoute allowedRoles={ROUTE_ROLES[path]}>{element}</RoleRoute>
)

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
            { path: '/',                  element: guard('/', <Home />) },
            { path: '/vat-tu',            element: guard('/vat-tu', <KhoHangPage />) },
            { path: '/nhap-kho',          element: guard('/nhap-kho', <NhapKhoPage />) },
            { path: '/xuat-kho',          element: guard('/xuat-kho', <XuatKhoPage />) },
            { path: '/danh-muc-vat-tu',   element: guard('/danh-muc-vat-tu', <DanhMucVatTuPage />) },
            { path: '/nha-cung-cap',      element: guard('/nha-cung-cap', <NhaCungCapPage />) },
            { path: '/lich-su-don-hang',  element: guard('/lich-su-don-hang', <LichSuDonHangPage />) },
            { path: '/yeu-cau',           element: guard('/yeu-cau', <YeuCauPage />) },
            { path: '/tra-cuu-imei',      element: guard('/tra-cuu-imei', <TraCuuImeiPage />) },
            { path: '/thong-ke',          element: guard('/thong-ke', <ThongKePage />) },
            { path: '/ton-kho-cu',        element: guard('/ton-kho-cu', <TonKhoCuPage />) },
            { path: '/nhan-vien',         element: guard('/nhan-vien', <NhanVienPage />) },
            { path: '/in-barcode',        element: guard('/in-barcode', <InBarcodePage />) },
            { path: '/quan-ly-kho',       element: guard('/quan-ly-kho', <QuanLyKhoPage />) },
            { path: '/logs',              element: guard('/logs', <AuditLogPage />) },
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
