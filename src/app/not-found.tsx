import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md text-center">
        {/* Error code */}
        <p className="text-8xl font-bold text-purple-600 dark:text-purple-400">
          404
        </p>

        {/* Title */}
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Page not found
        </h1>

        {/* Description */}
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
          It might have been moved, deleted, or never existed.
        </p>

        {/* Suggestions */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Here are some helpful links:
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <Home className="h-4 w-4" />
              Go to Homepage
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Go to Dashboard
            </Link>
            <Link
              href="/pay"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <Search className="h-4 w-4" />
              Make a Payment
            </Link>
          </div>
        </div>

        {/* Back button */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-gray-400 dark:text-gray-500">
          CryptoPayment Gateway &copy; 2026
        </p>
      </div>
    </div>
  )
}