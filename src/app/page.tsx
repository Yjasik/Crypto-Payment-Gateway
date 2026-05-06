'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

export default function HomePage() {
  const { isConnected, address } = useAccount()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      {/* Логотип */}
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold">
          🚀 CryptoPayment Gateway
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Accept crypto payments with ease
        </p>
      </div>
      
      {/* Кнопка подключения */}
      <ConnectButton />
      
      {/* Статус подключения */}
      {isConnected && (
        <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
          <p className="text-green-700 dark:text-green-300">
            ✅ Wallet connected!
          </p>
          <p className="address text-sm text-green-600 dark:text-green-400">
            {address}
          </p>
        </div>
      )}
      
      {/* Версии */}
      <div className="mt-8 rounded-lg border border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
        <p>wagmi@2.19.5 • rainbowkit@2.2.11 • viem@2.48.8</p>
        <p>Next.js 16.2.4 • TypeScript</p>
      </div>
    </div>
  )
}