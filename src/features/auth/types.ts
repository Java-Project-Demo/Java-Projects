export interface UserProfile {
  id: string
  username: string
  email: string
  roles: string[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: UserProfile
}
