export interface UserProfile {
  id: number
  username: string
  role: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  userId: number
  username: string
  isPasswordReset?: boolean
}

export const decodeJwt = (token: string): { id: number; username: string; role: string } | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { id: payload.id, username: payload.username, role: payload.role }
  } catch {
    return null
  }
}
