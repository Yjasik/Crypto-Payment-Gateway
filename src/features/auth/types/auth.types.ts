import type { Address } from 'viem'

// User role
export type UserRole = 'merchant' | 'admin'

// Auth session
export interface AuthSession {
  address: Address
  role: UserRole
  token: string
  expiresAt: number
}

// Login credentials
export interface LoginCredentials {
  address: Address
  signature: string
  message: string
}

// Auth state
export interface AuthState {
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

// Auth context value
export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshSession: () => Promise<void>
}

// SIWE (Sign-In with Ethereum) message
export interface SiweMessage {
  domain: string
  address: Address
  statement: string
  uri: string
  version: string
  chainId: number
  nonce: string
  issuedAt: string
}