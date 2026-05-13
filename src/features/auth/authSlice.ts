import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { UserProfile } from './types'
import { TOKEN_KEY } from '@/config/axios'
import { decodeJwt } from './types'

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  mustChangePassword: boolean
}

const PWD_RESET_FLAG = 'dawn_pwd_reset'
const _storedToken = localStorage.getItem(TOKEN_KEY)
const _restoredUser = _storedToken ? decodeJwt(_storedToken) : null

const initialState: AuthState = {
  user: _restoredUser,
  isAuthenticated: !!_storedToken && !!_restoredUser,
  mustChangePassword: localStorage.getItem(PWD_RESET_FLAG) === '1',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserProfile; mustChangePassword?: boolean }>,
    ) => {
      state.user = action.payload.user
      state.isAuthenticated = true
      state.mustChangePassword = !!action.payload.mustChangePassword
      if (action.payload.mustChangePassword) localStorage.setItem(PWD_RESET_FLAG, '1')
      else localStorage.removeItem(PWD_RESET_FLAG)
    },
    clearMustChangePassword: (state) => {
      state.mustChangePassword = false
      localStorage.removeItem(PWD_RESET_FLAG)
    },
    clearCredentials: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.mustChangePassword = false
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(PWD_RESET_FLAG)
    },
  },
})

export const { setCredentials, clearMustChangePassword, clearCredentials } = authSlice.actions
export default authSlice.reducer
