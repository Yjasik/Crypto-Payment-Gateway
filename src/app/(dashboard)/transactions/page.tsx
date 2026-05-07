'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Download,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'

// Transaction type definition
interface Transaction {
  id: string
  hash: string
  type: 'payment' | 'payout' | 'refund'
  amount: string
  token: string
  from: string
  to: string
  status: 'pending' | 'completed' | 'failed'
  timestamp: string
  productName?: string
}

// Mock data for development
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
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>('all')
  const [typeFilter, setTypeFilter] = useState<string | null>('all')
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

  // Format address for display
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(text)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  // Filter transactions
  const filteredTransactions = mockTransactions.filter((tx) => {
    const matchesSearch =
      searchQuery === '' ||
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount.includes(searchQuery) ||
      tx.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = !statusFilter || statusFilter === 'all' || tx.status === statusFilter
    const matchesType = !typeFilter || typeFilter === 'all' || tx.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Status badge color
  const getStatusBadge = (status: Transaction['status']) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
    }
    return variants[status]
  }

  // Type icon
  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'payment':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case 'payout':
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />
      case 'refund':
        return <ArrowUpRight className="h-4 w-4 text-orange-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
        <p className="text-gray-500 dark:text-gray-400">
          View and manage all your payment transactions
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by hash, amount, token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status filter */}
            <Select value={statusFilter ?? 'all'} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Type filter */}
            <Select value={typeFilter ?? 'all'} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="payout">Payouts</SelectItem>
                <SelectItem value="refund">Refunds</SelectItem>
              </SelectContent>
            </Select>

            {/* Export button */}
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isConnected
              ? `Transactions for ${formatAddress(address!)}`
              : 'All Transactions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ArrowDownLeft className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Connect your wallet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Connect your wallet to view your transaction history
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                No transactions found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Transaction Hash</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    {/* Type */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {getTypeIcon(tx.type)}
                        <span className="text-xs capitalize">{tx.type}</span>
                      </div>
                    </TableCell>

                    {/* Hash */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{formatAddress(tx.hash)}</span>
                        <button
                          onClick={() => copyToClipboard(tx.hash)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {copiedHash === tx.hash ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="font-medium">
                      {tx.amount} {tx.token}
                    </TableCell>

                    {/* Product */}
                    <TableCell className="text-sm text-gray-500">
                      {tx.productName || '-'}
                    </TableCell>

                    {/* From */}
                    <TableCell className="font-mono text-xs">
                      {formatAddress(tx.from)}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-sm text-gray-500">
                      {tx.timestamp}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge className={getStatusBadge(tx.status)}>
                        {tx.status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}