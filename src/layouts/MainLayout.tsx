import { useMemo, useState } from 'react'
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
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearCredentials } from '@/features/auth/authSlice'
import { useChangePasswordMutation, useLogoutMutation } from '@/features/auth/authApi'
import ChatPopup from '@/components/shared/ChatPopup.tsx'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import { ROUTE_ROLES, type URole } from '@/config/rolePermissions'

const { Header, Content, Footer, Sider } = Layout
const { Text } = Typography

interface MenuItem {
  key: string
  icon?: React.ReactNode
  labelKey: string
  roles?: URole[]
  children?: MenuItem[]
}

const rolesFor = (path: string): URole[] | undefined => ROUTE_ROLES[path]

const ALL_MENU: MenuItem[] = [
  {
    key: 'kho',
    labelKey: 'menu:group.warehouse',
    icon: <InboxOutlined />,
    children: [
      { key: '/', labelKey: 'menu:item.dashboard', icon: <DashboardOutlined />, roles: rolesFor('/') },
      { key: '/vat-tu', labelKey: 'menu:item.products', icon: <InboxOutlined />, roles: rolesFor('/vat-tu') },
      { key: '/nhap-kho', labelKey: 'menu:item.import', icon: <ImportOutlined />, roles: rolesFor('/nhap-kho') },
      { key: '/xuat-kho', labelKey: 'menu:item.export', icon: <ExportOutlined />, roles: rolesFor('/xuat-kho') },
      {
        key: '/quan-ly-kho',
        labelKey: 'menu:item.warehouseLayout',
        icon: <EnvironmentOutlined />,
        roles: rolesFor('/quan-ly-kho')
      },
      { key: '/kiem-ke', labelKey: 'menu:item.inventory', icon: <ScanOutlined />, roles: rolesFor('/kiem-ke') }
    ]
  },
  {
    key: 'danhmuc',
    labelKey: 'menu:group.category',
    icon: <AppstoreOutlined />,
    children: [
      { key: '/danh-muc-vat-tu', labelKey: 'menu:item.categories', icon: <AppstoreOutlined />, roles: rolesFor('/danh-muc-vat-tu') },
      { key: '/nha-cung-cap', labelKey: 'menu:item.suppliers', icon: <ShopOutlined />, roles: rolesFor('/nha-cung-cap') }
    ]
  },
  {
    key: 'banhang',
    labelKey: 'menu:group.sales',
    icon: <ShoppingCartOutlined />,
    children: [
      { key: '/lich-su-don-hang', labelKey: 'menu:item.orderHistory', icon: <ShoppingCartOutlined />, roles: rolesFor('/lich-su-don-hang') },
      { key: '/bao-hanh', labelKey: 'menu:item.warranty', icon: <SafetyCertificateOutlined />, roles: rolesFor('/bao-hanh') },
      { key: '/tra-cuu-imei', labelKey: 'menu:item.imeiLookup', icon: <SearchOutlined />, roles: rolesFor('/tra-cuu-imei') }
    ]
  },
  {
    key: 'baocao',
    labelKey: 'menu:group.report',
    icon: <BarChartOutlined />,
    children: [
      { key: '/thong-ke', labelKey: 'menu:item.statistics', icon: <BarChartOutlined />, roles: rolesFor('/thong-ke') },
      { key: '/ton-kho-cu', labelKey: 'menu:item.oldStock', icon: <WarningOutlined />, roles: rolesFor('/ton-kho-cu') }
    ]
  },
  {
    key: 'hethong',
    labelKey: 'menu:group.system',
    icon: <TeamOutlined />,
    children: [
      { key: '/nhan-vien', labelKey: 'menu:item.employees', icon: <TeamOutlined />, roles: rolesFor('/nhan-vien') },
      { key: '/in-barcode', labelKey: 'menu:item.printBarcode', icon: <BarcodeOutlined />, roles: rolesFor('/in-barcode') },
      { key: '/logs', labelKey: 'menu:item.logs', icon: <HistoryOutlined />, roles: rolesFor('/logs') }
    ]
  }
]

const filterMenuByRole = (items: MenuItem[], role: URole): MenuItem[] => {
  return items
    .filter((item) => !item.roles || item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children ? filterMenuByRole(item.children, role) : undefined
    }))
    .filter((item) => !item.children || item.children.length > 0)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const buildAntdItems = (items: MenuItem[], t: (key: string) => string): any[] =>
  items.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: t(item.labelKey),
    children: item.children ? buildAntdItems(item.children, t) : undefined
  }))

const MainLayout = () => {
  const { token } = theme.useToken()
  const { message } = App.useApp()
  const { t } = useTranslation(['common', 'menu', 'auth'])
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const [collapsed, setCollapsed] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)
  const [pwdForm] = Form.useForm()

  const [changePassword, { isLoading: changingPwd }] = useChangePasswordMutation()
  const [logout] = useLogoutMutation()

  const role = (user?.role ?? 'SALES') as URole
  const filteredMenu = useMemo(() => filterMenuByRole(ALL_MENU, role), [role])
  const antdMenuItems = useMemo(() => buildAntdItems(filteredMenu, t), [filteredMenu, t])

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
        void message.error(t('auth:changePassword.mismatch'))
        return
      }
      try {
        await changePassword({ oldPassword, newPassword, confirmPassword }).unwrap()
        void message.success(t('auth:changePassword.success'))
        pwdForm.resetFields()
        setPwdOpen(false)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? t('auth:changePassword.fail'))
      }
    })
  }

  const userMenuItems = [
    {
      key: 'change-pwd',
      icon: <KeyOutlined />,
      label: t('user.menu.changePassword'),
      onClick: () => {
        pwdForm.resetFields()
        setPwdOpen(true)
      }
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('user.menu.logout'),
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
          {t('appTitle')}
        </Text>

        <div className='flex items-center gap-3'>
          <LanguageSwitcher />

          <Dropdown menu={{ items: userMenuItems }} placement='bottomRight'>
            <div className='flex items-center gap-2 cursor-pointer select-none'>
              <Avatar size='small' icon={<UserOutlined />} style={{ background: 'rgba(255,255,255,0.3)' }} />
              <Text style={{ color: '#fff' }}>{user?.username ?? t('user.defaultName')}</Text>
            </div>
          </Dropdown>
        </div>
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
            {t('footer', { year: new Date().getFullYear() })}
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
            {t('auth:changePassword.title')}
          </>
        }
        open={pwdOpen}
        onCancel={() => setPwdOpen(false)}
        width={440}
        footer={[
          <Button key='c' onClick={() => setPwdOpen(false)}>
            {t('button.cancel')}
          </Button>,
          <Button key='s' type='primary' loading={changingPwd} onClick={handleChangePwd}>
            {t('button.confirm')}
          </Button>
        ]}
      >
        <Form form={pwdForm} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item
            label={t('auth:changePassword.oldPassword')}
            name='oldPassword'
            rules={[{ required: true, message: t('auth:changePassword.oldPasswordRequired') }]}
          >
            <Input.Password autoFocus placeholder={t('auth:changePassword.oldPasswordPlaceholder')} />
          </Form.Item>
          <Form.Item
            label={t('auth:changePassword.newPassword')}
            name='newPassword'
            rules={[
              { required: true, message: t('auth:changePassword.newPasswordRequired') },
              { min: 6, message: t('auth:changePassword.minLength') }
            ]}
          >
            <Input.Password placeholder={t('auth:changePassword.newPasswordPlaceholder')} />
          </Form.Item>
          <Form.Item
            label={t('auth:changePassword.confirmPassword')}
            name='confirmPassword'
            rules={[
              { required: true, message: t('auth:changePassword.confirmPasswordRequired') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve()
                  return Promise.reject(new Error(t('auth:changePassword.mismatch')))
                }
              })
            ]}
          >
            <Input.Password placeholder={t('auth:changePassword.confirmPasswordPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}

export default MainLayout
