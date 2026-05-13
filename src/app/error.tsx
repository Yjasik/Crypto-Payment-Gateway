'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  // Log error to monitoring service
  useEffect(() => {
    console.error('[Error Boundary] Unhandled error:', error)

    // TODO: Send to error tracking service (Sentry, etc.)
    // captureException(error)
  }, [error])

  // Format error message for display
  const getErrorMessage = () => {
    // Return user-friendly messages for common errors
    if (error.message.includes('fetch')) {
      return 'Unable to connect to the server. Please check your internet connection.'
    }
    if (error.message.includes('timeout')) {
      return 'The request took too long. Please try again.'
    }
    if (error.message.includes('network')) {
      return 'Network error occurred. Please check your connection.'
    }

    // Default: show generic message
    return 'Something went wrong. Please try again or go back to the homepage.'
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md text-center">
        {/* Error icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>

        {/* Error title */}
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Oops! Something went wrong
        </h1>

        {/* Error message */}
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          {getErrorMessage()}
        </p>

        {/* Error details (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-6 mx-auto max-w-sm">
            <CardContent className="pt-6 text-left">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Error Details
              </p>
              <pre className="mt-2 max-h-32 overflow-auto rounded bg-gray-100 p-3 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {error.message}
              </pre>
              {error.digest && (
                <p className="mt-2 text-xs text-gray-400">
                  Error ID: {error.digest}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Home className="h-4 w-4" />
            Go to Homepage
          </Link>
        </div>

        {/* Additional help */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Need help?
          </p>
          <div className="mt-2 flex flex-col gap-2 text-sm">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Go to Dashboard
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Check Settings
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-gray-400 dark:text-gray-500">
          If the problem persists, please contact support.
          {error.digest && (
            <span className="ml-2 font-mono">ID: {error.digest}</span>
          )}
        </p>
      </div>
    </div>
  )
}