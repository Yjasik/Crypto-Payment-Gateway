'use client'

import { useState, useCallback } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import type { AuthSession, LoginCredentials } from '../types/auth.types'
import * as authApi from '../api/auth.api'

// Initialize session from localStorage (outside effect)
function getInitialSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  
  const storedSession = localStorage.getItem('auth_session')
  if (!storedSession) return null
  
  try {
    const parsed = JSON.parse(storedSession) as AuthSession
    if (parsed.expiresAt > Date.now()) {
      return parsed
    }
    localStorage.removeItem('auth_session')
  } catch {
    localStorage.removeItem('auth_session')
  }
  
  return null
}

export function useAuth() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  
  // Initialize directly from localStorage
  const [session, setSession] = useState<AuthSession | null>(getInitialSession)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Login with SIWE
  const login = useCallback(async () => {
    if (!address) {
      setError('Wallet not connected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 1. Get nonce
      const nonce = await authApi.generateNonce(address)

      // 2. Create SIWE message
      const message = authApi.createSiweMessage({
        domain: window.location.host,
        address: address,
        statement: 'Sign in to CryptoPayment Gateway',
        uri: window.location.origin,
        version: '1',
        chainId: 1,
        nonce,
        issuedAt: new Date().toISOString(),
      })

      // 3. Sign message with wallet
      const signature = await signMessageAsync({ message })

      // 4. Verify signature
      const credentials: LoginCredentials = {
        address: address,
        signature,
        message,
      }

      const newSession = await authApi.verifySignature(credentials)

      // 5. Store session
      localStorage.setItem('auth_session', JSON.stringify(newSession))
      setSession(newSession)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [address, signMessageAsync])

  // Logout
  const logout = useCallback(() => {
    if (session?.token) {
      authApi.logoutSession(session.token).catch(console.error)
    }
    localStorage.removeItem('auth_session')
    setSession(null)
    setError(null)
  }, [session])

  // Refresh session
  const refreshSession = useCallback(async () => {
    if (!session?.token) return

    try {
      const newSession = await authApi.refreshSession(session.token)
      localStorage.setItem('auth_session', JSON.stringify(newSession))
      setSession(newSession)
    } catch {
      logout()
    }
  }, [session, logout])

  return {
    session,
    isLoading,
    error,
    isAuthenticated: !!session,
    isAdmin: session?.role === 'admin',
    login,
    logout,
    refreshSession,
  }
}