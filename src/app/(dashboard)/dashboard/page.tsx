'use client'

import { useAccount, useBalance } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Wallet,
  ArrowLeftRight,
  Package,
  TrendingUp,
  ArrowUpRight,
  Plus,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400">
          {isConnected
            ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}`
            : 'Connect your wallet to view dashboard'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Wallet Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isConnected && balance
                ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}`
                : '$0.00'}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Native token balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="mt-1 text-xs text-green-600">+0% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Transactions
            </CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              No transactions yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Products
            </CardTitle>
            <Package className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              No products created
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isConnected ? (
              <>
                <Link
                  href="/products"
                  className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <Plus className="h-4 w-4" />
                  Create Product
                </Link>
                <Link
                  href="/payouts"
                  className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Request Payout
                </Link>
                <Link
                  href="/transactions"
                  className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  View Transactions
                </Link>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Connect your wallet to get started
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <Link
              href="/transactions"
              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              View all
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ArrowLeftRight className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No transactions yet
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Your recent payments will appear here
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Wallet className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Connect wallet to view transactions
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}