'use client'

import { useState } from 'react'
import type { AuthSession } from '../types/auth.types'

// Initialize from localStorage (outside component)
function getInitialSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  
  const stored = localStorage.getItem('auth_session')
  if (!stored) return null
  
  try {
    const parsed = JSON.parse(stored) as AuthSession
    if (parsed.expiresAt > Date.now()) {
      return parsed
    }
    localStorage.removeItem('auth_session')
  } catch {
    localStorage.removeItem('auth_session')
  }
  
  return null
}

export function useSession() {
  const [session, setSession] = useState<AuthSession | null>(getInitialSession)
  const [isLoading] = useState(false) // Loading done in init

  const saveSession = (newSession: AuthSession) => {
    localStorage.setItem('auth_session', JSON.stringify(newSession))
    setSession(newSession)
  }

  const clearSession = () => {
    localStorage.removeItem('auth_session')
    setSession(null)
  }

  return {
    session,
    isLoading,
    isAuthenticated: !!session,
    isAdmin: session?.role === 'admin',
    saveSession,
    clearSession,
  }
}