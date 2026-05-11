// src/components/transactions/transaction-table.tsx — Reusable transaction table component
// Used in transactions page and dashboard recent transactions

'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  ExternalLink,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react'

// Transaction type
export interface Transaction {
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

interface TransactionTableProps {
  transactions: Transaction[]
  showFilters?: boolean
  showPagination?: boolean
  compact?: boolean
  itemsPerPage?: number
}

export function TransactionTable({
  transactions,
  showFilters = true,
  showPagination = true,
  compact = false,
  itemsPerPage = 10,
}: TransactionTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>('all')
  const [typeFilter, setTypeFilter] = useState<string | null>('all')
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Format address for display
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(text)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
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

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset page when filters change
  const handleFilterChange = (filter: string, value: string | null) => {
    if (filter === 'status') setStatusFilter(value)
    if (filter === 'type') setTypeFilter(value)
    setCurrentPage(1)
  }

  // Status badge styling
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
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by hash, amount, token..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9"
            />
          </div>

          {/* Status filter */}
          <Select
            value={statusFilter ?? 'all'}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
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
          <Select
            value={typeFilter ?? 'all'}
            onValueChange={(value) => handleFilterChange('type', value)}
          >
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
        </div>
      )}

      {/* Empty state */}
      {filteredTransactions.length === 0 ? (
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
        <>
          {/* Table */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800">
            <Table>
              <TableHeader>
                <TableRow>
                  {!compact && <TableHead>Type</TableHead>}
                  <TableHead>Transaction Hash</TableHead>
                  <TableHead>Amount</TableHead>
                  {!compact && <TableHead>Product</TableHead>}
                  <TableHead>From</TableHead>
                  {!compact && <TableHead>Date</TableHead>}
                  <TableHead>Status</TableHead>
                  {!compact && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    {/* Type */}
                    {!compact && (
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {getTypeIcon(tx.type)}
                          <span className="text-xs capitalize">{tx.type}</span>
                        </div>
                      </TableCell>
                    )}

                    {/* Hash */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">
                          {formatAddress(tx.hash)}
                        </span>
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
                    {!compact && (
                      <TableCell className="text-sm text-gray-500">
                        {tx.productName || '-'}
                      </TableCell>
                    )}

                    {/* From */}
                    <TableCell className="font-mono text-xs">
                      {formatAddress(tx.from)}
                    </TableCell>

                    {/* Date */}
                    {!compact && (
                      <TableCell className="text-sm text-gray-500">
                        {tx.timestamp}
                      </TableCell>
                    )}

                    {/* Status */}
                    <TableCell>
                      <Badge className={getStatusBadge(tx.status)}>
                        {tx.status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    {!compact && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {showPagination && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}{' '}
                of {filteredTransactions.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}