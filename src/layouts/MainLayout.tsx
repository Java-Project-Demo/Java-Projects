import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Avatar, Dropdown, Layout, Menu, theme, Typography } from 'antd'
import {
  LogoutOutlined,
  UserOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  ImportOutlined,
  ExportOutlined,
  BarChartOutlined,
  TeamOutlined,
  FileTextOutlined,
  InboxOutlined,
  BarcodeOutlined
} from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearCredentials } from '@/features/auth/authSlice'
import { useLogoutMutation } from '@/features/auth/authApi'

const { Header, Content, Footer, Sider } = Layout
const { Text } = Typography

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Tổng quan' },
  { key: '/danh-muc-vat-tu', icon: <AppstoreOutlined />, label: 'Danh mục vật tư' },
  { key: '/xuat-kho', icon: <ExportOutlined />, label: 'Xuất kho vật tư' },
  { key: '/nhap-kho', icon: <ImportOutlined />, label: 'Nhập kho vật tư' },
  { key: '/thong-ke', icon: <BarChartOutlined />, label: 'Thống kê' },
  { key: '/nhan-vien', icon: <TeamOutlined />, label: 'Nhân viên' },
  { key: '/yeu-cau', icon: <FileTextOutlined />, label: 'Yêu cầu' },
  { key: '/vat-tu', icon: <InboxOutlined />, label: 'Vật tư' },
  { key: '/in-barcode', icon: <BarcodeOutlined />, label: 'In Barcode' }
]

const MainLayout = () => {
  const { token } = theme.useToken()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const [logout] = useLogoutMutation()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } finally {
      dispatch(clearCredentials())
      navigate('/login', { replace: true })
    }
  }

  return (
    <Layout className='min-h-screen'>
      <Header
        style={{
          background: token.colorPrimary,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <Text strong style={{ fontSize: 18, color: '#fff' }}>
          Warehouse Management System
        </Text>

        <Dropdown
          menu={{
            items: [
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Đăng xuất',
                danger: true,
                onClick: handleLogout
              }
            ]
          }}
          placement='bottomRight'
        >
          <div className='flex items-center gap-2 cursor-pointer select-none'>
            <Avatar size='small' icon={<UserOutlined />} style={{ background: 'rgba(255,255,255,0.3)' }} />
            <Text style={{ color: '#fff' }}>{user?.username ?? 'User'}</Text>
          </div>
        </Dropdown>
      </Header>

      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={220}
          style={{ background: '#001529' }}
        >
          <Menu
            theme='dark'
            mode='inline'
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0 }}
          />
        </Sider>

        <Layout style={{ background: '#f5f5f5' }}>
          <Content style={{ padding: '24px', minHeight: 0 }}>
            <Outlet />
          </Content>
          <Footer style={{ textAlign: 'center', color: token.colorTextTertiary, background: '#f5f5f5' }}>
            UTC System ©{new Date().getFullYear()}
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default MainLayout
