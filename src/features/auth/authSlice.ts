import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { UserProfile } from './types'
import { TOKEN_KEY } from '@/config/axios'
import { decodeJwt } from './types'

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
}

const _storedToken = localStorage.getItem(TOKEN_KEY)
const _restoredUser = _storedToken ? decodeJwt(_storedToken) : null

const initialState: AuthState = {
  user: _restoredUser,
  isAuthenticated: !!_storedToken && !!_restoredUser,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    clearCredentials: (state) => {
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem(TOKEN_KEY)
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
