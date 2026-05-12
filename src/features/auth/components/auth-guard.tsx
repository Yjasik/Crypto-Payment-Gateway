'use client'

import { useAuth } from '../hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'
import type { ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
  requireAdmin?: boolean
  fallback?: ReactNode
}

export function AuthGuard({ children, requireAdmin = false, fallback }: AuthGuardProps) {
  const { isAuthenticated, isAdmin, isLoading, login } = useAuth()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-sm text-gray-500">Checking authentication...</p>
        </CardContent>
      </Card>
    )
  }

  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>

    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Shield className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-semibold">Authentication Required</h3>
          <p className="mt-1 text-sm text-gray-500">
            Sign in with your Ethereum wallet to access this page
          </p>
          <Button className="mt-4" onClick={login}>
            <Shield className="mr-2 h-4 w-4" />
            Sign In with Ethereum
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (requireAdmin && !isAdmin) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Shield className="mb-3 h-12 w-12 text-red-300 dark:text-red-600" />
          <h3 className="text-lg font-semibold text-red-600">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need admin privileges to access this page
          </p>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}