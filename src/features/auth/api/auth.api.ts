import type { AuthSession, LoginCredentials, SiweMessage } from '../types/auth.types'

// Base URL for auth API
const AUTH_API_URL = '/api/auth'

// Generate nonce for SIWE
export async function generateNonce(address: string): Promise<string> {
  const response = await fetch(`${AUTH_API_URL}/nonce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate nonce')
  }

  const { nonce } = await response.json()
  return nonce
}

// Create SIWE message
export function createSiweMessage(params: SiweMessage): string {
  return `${params.domain} wants you to sign in with your Ethereum account:
${params.address}

${params.statement}

URI: ${params.uri}
Version: ${params.version}
Chain ID: ${params.chainId}
Nonce: ${params.nonce}
Issued At: ${params.issuedAt}`
}

// Verify signature and create session
export async function verifySignature(credentials: LoginCredentials): Promise<AuthSession> {
  const response = await fetch(`${AUTH_API_URL}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Authentication failed')
  }

  return response.json()
}

// Refresh session
export async function refreshSession(token: string): Promise<AuthSession> {
  const response = await fetch(`${AUTH_API_URL}/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Session expired')
  }

  return response.json()
}

// Logout
export async function logoutSession(token: string): Promise<void> {
  await fetch(`${AUTH_API_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
}

// Check if user is admin
export async function checkAdminStatus(address: string): Promise<boolean> {
  const response = await fetch(`${AUTH_API_URL}/admin-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  })

  if (!response.ok) return false

  const { isAdmin } = await response.json()
  return isAdmin
}