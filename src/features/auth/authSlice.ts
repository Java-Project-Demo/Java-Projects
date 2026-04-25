import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { UserProfile } from './types'
import { TOKEN_KEY } from '@/config/axios'

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
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
