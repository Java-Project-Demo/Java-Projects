import { Outlet, useNavigate } from 'react-router-dom'
import { Avatar, Dropdown, Layout, theme, Typography } from 'antd'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearCredentials } from '@/features/auth/authSlice'
import { useLogoutMutation } from '@/features/auth/authApi'

const { Header, Content, Footer } = Layout
const { Text } = Typography

const MainLayout = () => {
  const { token } = theme.useToken()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const [logout] = useLogoutMutation()

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
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Text strong style={{ fontSize: 18, color: token.colorPrimary }}>
          UTC System
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
            <Avatar size='small' icon={<UserOutlined />} style={{ background: token.colorPrimary }} />
            <Text>{user?.username ?? 'User'}</Text>
          </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: '24px', minHeight: 0 }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', color: token.colorTextTertiary }}>
        UTC System ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  )
}

export default MainLayout
