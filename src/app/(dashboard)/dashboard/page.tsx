// src/app/(dashboard)/dashboard/page.tsx — Merchant dashboard
'use client'

import { useAccount, useBalance } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TransactionTable } from '@/components/transactions/transaction-table'
import { StatsCard } from '@/components/dashboard/stats-cards'
import type { Transaction } from '@/components/transactions/transaction-table'
import {
  Wallet,
  ArrowLeftRight,
  Package,
  TrendingUp,
  ArrowUpRight,
  Plus,
} from 'lucide-react'
import Link from 'next/link'

// Mock recent transactions for dashboard
const recentTransactions: Transaction[] = [
  {
    id: '1',
    hash: '0x1234...5678',
    type: 'payment',
    amount: '150.00',
    token: 'USDC',
    from: '0xabc...def',
    to: '0x789...012',
    status: 'completed',
    timestamp: '2026-05-07 14:30',
    productName: 'Premium NFT Collection',
  },
  {
    id: '2',
    hash: '0x8765...4321',
    type: 'payment',
    amount: '0.05',
    token: 'ETH',
    from: '0xdef...ghi',
    to: '0x012...345',
    status: 'pending',
    timestamp: '2026-05-07 13:15',
    productName: 'DeFi Course Access',
  },
]

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400">
          {isConnected
            ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}`
            : 'Connect your wallet to view dashboard'}
        </p>
      </div>

      {/* Stats cards — using reusable StatsCard component */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Wallet Balance"
          value={
            isConnected && balance
              ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}`
              : '$0.00'
          }
          description="Native token balance"
          icon={Wallet}
        />
        <StatsCard
          title="Total Revenue"
          value="$0.00"
          description="+0% from last month"
          icon={TrendingUp}
          trend="up"
        />
        <StatsCard
          title="Transactions"
          value="0"
          description="No transactions yet"
          icon={ArrowLeftRight}
        />
        <StatsCard
          title="Products"
          value="0"
          description="No products created"
          icon={Package}
        />
      </div>

      {/* Quick actions + recent transactions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Quick actions */}
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

        {/* Recent transactions — compact mode */}
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
            {!isConnected ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Wallet className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Connect wallet to view transactions
                </p>
              </div>
            ) : (
              <TransactionTable
                transactions={recentTransactions}
                compact={true}
                showFilters={false}
                showPagination={false}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}