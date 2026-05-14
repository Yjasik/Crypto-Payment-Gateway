'use client'

import { useAccount, useChainId } from 'wagmi'
import { formatEther, createPublicClient, http } from 'viem'
import { sepolia } from 'wagmi/chains'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useState } from 'react'

const recentTransactions: Transaction[] = []

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [ethBalance, setEthBalance] = useState('0.00')
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [lastFetched, setLastFetched] = useState<string | null>(null)

  // Fetch balance — called manually or on button click
  const fetchBalance = useCallback(async () => {
    if (!address) return

    setIsLoadingBalance(true)

    try {
      const client = createPublicClient({
        chain: sepolia,
        transport: http(
          process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
            'https://sepolia.gateway.tenderly.co'
        ),
      })

      const bal = await client.getBalance({ address: address as `0x${string}` })
      const formatted = formatEther(bal)
      setEthBalance(Number(formatted).toFixed(4))
      setLastFetched(address)
    } catch (err) {
      console.error('Failed to fetch balance:', err)
      setEthBalance('Error')
    } finally {
      setIsLoadingBalance(false)
    }
  }, [address])

  // Auto-fetch on first connect
  if (address && isConnected && lastFetched !== address) {
    fetchBalance()
  }

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400">
          {isConnected
            ? `Connected: ${formatAddress(address!)}`
            : 'Connect your wallet to view dashboard'}
        </p>
        {isConnected && chainId !== sepolia.id && (
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            ⚠️ Switch to Sepolia network (current: {chainId})
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Wallet Balance"
          value={
            isLoadingBalance
              ? 'Loading...'
              : `${ethBalance} ETH`
          }
          description="Sepolia testnet"
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isConnected ? (
              <>
                <button
                  onClick={fetchBalance}
                  disabled={isLoadingBalance}
                  className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                  Refresh Balance
                </button>
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
            {!isConnected ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Wallet className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Connect wallet to view transactions
                </p>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ArrowLeftRight className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No transactions yet
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Your payments will appear here
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