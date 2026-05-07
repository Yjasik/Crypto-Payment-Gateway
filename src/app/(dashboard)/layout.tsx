import type { Metadata } from 'next'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | CryptoPayment Gateway',
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Хедер */}
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 dark:bg-gray-900/50">
          {children}
        </main>
      </div>
    </div>
  )
}