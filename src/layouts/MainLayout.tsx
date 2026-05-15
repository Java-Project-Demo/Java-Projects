import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { App, Avatar, Button, Dropdown, Form, Input, Layout, Menu, Modal, theme, Typography } from 'antd'
import {
  AppstoreOutlined,
  BarChartOutlined,
  BarcodeOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  ExportOutlined,
  HistoryOutlined,
  ImportOutlined,
  InboxOutlined,
  KeyOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  ScanOutlined,
  SearchOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearCredentials } from '@/features/auth/authSlice'
import { useChangePasswordMutation, useLogoutMutation } from '@/features/auth/authApi'
import ChatPopup from '@/components/shared/ChatPopup.tsx'

const { Header, Content, Footer, Sider } = Layout
const { Text } = Typography

interface MenuItem {
  key: string
  icon?: React.ReactNode
  label: string
  roles?: string[]
  children?: MenuItem[]
}

const ALL_MENU: MenuItem[] = [
  {
    key: 'kho',
    label: 'Kho hàng',
    icon: <InboxOutlined />,
    children: [
      { key: '/', label: 'Tổng quan', icon: <DashboardOutlined /> },
      { key: '/vat-tu', label: 'Vật tư', icon: <InboxOutlined />, roles: ['ADMIN', 'STOCK'] },
      { key: '/nhap-kho', label: 'Nhập kho', icon: <ImportOutlined />, roles: ['ADMIN', 'STOCK'] },
      { key: '/xuat-kho', label: 'Xuất kho', icon: <ExportOutlined />, roles: ['ADMIN', 'SALES'] },
      { key: '/quan-ly-kho', label: 'Quản lý kho vật lý', icon: <EnvironmentOutlined />, roles: ['ADMIN', 'STOCK'] },
      { key: '/kiem-ke', label: 'Kiểm kê', icon: <ScanOutlined />, roles: ['ADMIN', 'STOCK'] }
    ]
  },
  {
    key: 'danhmuc',
    label: 'Danh mục',
    icon: <AppstoreOutlined />,
    children: [
      { key: '/danh-muc-vat-tu', label: 'Danh mục vật tư', icon: <AppstoreOutlined /> },
      { key: '/nha-cung-cap', label: 'Nhà cung cấp', icon: <ShopOutlined /> }
    ]
  },
  {
    key: 'banhang',
    label: 'Bán hàng',
    icon: <ShoppingCartOutlined />,
    children: [
      { key: '/lich-su-don-hang', label: 'Lịch sử đơn hàng', icon: <ShoppingCartOutlined /> },
      { key: '/bao-hanh', label: 'Bảo hành', icon: <SafetyCertificateOutlined /> },
      { key: '/tra-cuu-imei', label: 'Tra cứu IMEI', icon: <SearchOutlined /> }
    ]
  },
  {
    key: 'baocao',
    label: 'Báo cáo',
    icon: <BarChartOutlined />,
    children: [
      { key: '/thong-ke', label: 'Thống kê', icon: <BarChartOutlined />, roles: ['ADMIN'] },
      { key: '/ton-kho-cu', label: 'Tồn kho cũ', icon: <WarningOutlined />, roles: ['ADMIN', 'STOCK'] }
    ]
  },
  {
    key: 'hethong',
    label: 'Hệ thống',
    icon: <TeamOutlined />,
    children: [
      { key: '/nhan-vien', label: 'Nhân viên', icon: <TeamOutlined />, roles: ['ADMIN'] },
      { key: '/in-barcode', label: 'In Barcode', icon: <BarcodeOutlined /> },
      { key: '/logs', label: 'Logs', icon: <HistoryOutlined />, roles: ['ADMIN'] }
    ]
  }
]

const filterMenuByRole = (items: MenuItem[], role: string): MenuItem[] => {
  return items
    .filter((item) => !item.roles || item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children ? filterMenuByRole(item.children, role) : undefined
    }))
    .filter((item) => !item.children || item.children.length > 0)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const buildAntdItems = (items: MenuItem[]): any[] =>
  items.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    children: item.children ? buildAntdItems(item.children) : undefined
  }))

const MainLayout = () => {
  const { token } = theme.useToken()
  const { message } = App.useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const [collapsed, setCollapsed] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)
  const [pwdForm] = Form.useForm()

  const [changePassword, { isLoading: changingPwd }] = useChangePasswordMutation()
  const [logout] = useLogoutMutation()

  const role = user?.role ?? 'SALES'
  const filteredMenu = filterMenuByRole(ALL_MENU, role)
  const antdMenuItems = buildAntdItems(filteredMenu)

  // Find which submenu keys should be open based on current path
  const openKeys = filteredMenu.filter((g) => g.children?.some((c) => c.key === location.pathname)).map((g) => g.key)

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } catch {
      // Ignore — token có thể đã hết hạn, vẫn clear FE
    }
    dispatch(clearCredentials())
    navigate('/login', { replace: true })
  }

  const handleChangePwd = () => {
    pwdForm.validateFields().then(async (values) => {
      const { oldPassword, newPassword, confirmPassword } = values as {
        oldPassword: string
        newPassword: string
        confirmPassword: string
      }
      if (newPassword !== confirmPassword) {
        void message.error('Mật khẩu mới và xác nhận không khớp')
        return
      }
      try {
        await changePassword({ oldPassword, newPassword, confirmPassword }).unwrap()
        void message.success('Đổi mật khẩu thành công!')
        pwdForm.resetFields()
        setPwdOpen(false)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? 'Mật khẩu cũ không đúng')
      }
    })
  }

  const userMenuItems = [
    {
      key: 'change-pwd',
      icon: <KeyOutlined />,
      label: 'Đổi mật khẩu',
      onClick: () => {
        pwdForm.resetFields()
        setPwdOpen(true)
      }
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout
    }
  ]

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

        <Dropdown menu={{ items: userMenuItems }} placement='bottomRight'>
          <div className='flex items-center gap-2 cursor-pointer select-none'>
            <Avatar size='small' icon={<UserOutlined />} style={{ background: 'rgba(255,255,255,0.3)' }} />
            <Text style={{ color: '#fff' }}>{user?.username ?? 'User'}</Text>
          </div>
        </Dropdown>
      </Header>

      <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={220}
          style={{ background: '#001529', minHeight: '100%' }}
        >
          <Menu
            theme='dark'
            mode='inline'
            selectedKeys={[location.pathname]}
            defaultOpenKeys={openKeys}
            items={antdMenuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0 }}
          />
        </Sider>

        <Layout style={{ background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
          <Content style={{ padding: '24px', flex: 1 }}>
            <Outlet />
          </Content>
          <Footer style={{ textAlign: 'center', color: token.colorTextTertiary, background: '#f5f5f5' }}>
            UTC System ©{new Date().getFullYear()}
          </Footer>
        </Layout>
      </Layout>

      {/* Chatbox Modal*/}
      <ChatPopup username={user?.username} />
      {/* Change Password Modal */}
      <Modal
        title={
          <>
            <KeyOutlined style={{ color: '#1677ff', marginRight: 8 }} />
            Đổi mật khẩu
          </>
        }
        open={pwdOpen}
        onCancel={() => setPwdOpen(false)}
        width={440}
        footer={[
          <Button key='c' onClick={() => setPwdOpen(false)}>
            Huỷ
          </Button>,
          <Button key='s' type='primary' loading={changingPwd} onClick={handleChangePwd}>
            Xác nhận
          </Button>
        ]}
      >
        <Form form={pwdForm} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item
            label='Mật khẩu hiện tại'
            name='oldPassword'
            rules={[{ required: true, message: 'Nhập mật khẩu hiện tại' }]}
          >
            <Input.Password autoFocus placeholder='Mật khẩu hiện tại' />
          </Form.Item>
          <Form.Item
            label='Mật khẩu mới'
            name='newPassword'
            rules={[
              { required: true, message: 'Nhập mật khẩu mới' },
              { min: 6, message: 'Tối thiểu 6 ký tự' }
            ]}
          >
            <Input.Password placeholder='Mật khẩu mới' />
          </Form.Item>
          <Form.Item
            label='Xác nhận mật khẩu mới'
            name='confirmPassword'
            rules={[
              { required: true, message: 'Xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve()
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'))
                }
              })
            ]}
          >
            <Input.Password placeholder='Nhập lại mật khẩu mới' />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}

export default MainLayout
