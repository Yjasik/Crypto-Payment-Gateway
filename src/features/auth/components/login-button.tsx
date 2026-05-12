'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '../hooks/use-auth'
import { LogIn, LogOut, Loader2, Shield } from 'lucide-react'

export function LoginButton() {
  const { isAuthenticated, isLoading, login, logout } = useAuth()

  if (isLoading) {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    )
  }

  if (isAuthenticated) {
    return (
      <Button variant="outline" onClick={logout}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    )
  }

  return (
    <Button onClick={login}>
      <Shield className="mr-2 h-4 w-4" />
      Sign In with Ethereum
    </Button>
  )
}