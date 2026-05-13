'use client'

import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TransactionTable } from '@/components/transactions/transaction-table'
import type { Transaction } from '@/components/transactions/transaction-table'
import {
  ArrowDownLeft,
  Download,
} from 'lucide-react'

// Mock data for development — переиспользуем тип из компонента
const mockTransactions: Transaction[] = [
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
  {
    id: '3',
    hash: '0x9876...5432',
    type: 'payout',
    amount: '500.00',
    token: 'USDT',
    from: '0x345...678',
    to: '0x901...234',
    status: 'completed',
    timestamp: '2026-05-06 10:00',
  },
  {
    id: '4',
    hash: '0x2468...1357',
    type: 'refund',
    amount: '25.00',
    token: 'USDC',
    from: '0x567...890',
    to: '0xabc...def',
    status: 'failed',
    timestamp: '2026-05-05 16:45',
  },
]

export default function TransactionsPage() {
  const { isConnected, address } = useAccount()

  // Format address for display
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
          <p className="text-gray-500 dark:text-gray-400">
            View and manage all your payment transactions
          </p>
        </div>

        {/* Export button */}
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Transactions */}
      {!isConnected ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ArrowDownLeft className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Connect your wallet
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Connect your wallet to view your transaction history
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Transactions for {formatAddress(address!)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable
              transactions={mockTransactions}
              showFilters={true}
              showPagination={true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}