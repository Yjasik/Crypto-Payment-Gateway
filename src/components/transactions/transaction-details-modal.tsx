'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Transaction } from '@/components/transactions/transaction-table'
import {
  Copy,
  Check,
  ExternalLink,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  User,
  Package,
  DollarSign,
  Hash,
  Calendar,
  AlertCircle,
  X,
} from 'lucide-react'

// Extended transaction details
interface TransactionDetails extends Transaction {
  to: string
  fee: string
  blockNumber: string
  confirmations: number
  network: string
  productName?: string
  productId?: string
  notes?: string
}

interface TransactionDetailsModalProps {
  transaction: TransactionDetails | null
  isOpen: boolean
  onClose: () => void
  onViewOnExplorer?: (hash: string) => void
}

export function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
  onViewOnExplorer,
}: TransactionDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!transaction) return null

  // Format address
  const formatAddress = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-6)}`

  // Copy to clipboard
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Status badge
  const getStatusBadge = (status: Transaction['status']) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
    }
    return variants[status]
  }

  // Status icon
  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  // Type icon
  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'payment':
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />
      case 'payout':
        return <ArrowUpRight className="h-5 w-5 text-blue-500" />
      case 'refund':
        return <ArrowUpRight className="h-5 w-5 text-orange-500" />
    }
  }

  // Type label
  const getTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'payment':
        return 'Payment Received'
      case 'payout':
        return 'Withdrawal'
      case 'refund':
        return 'Refund'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                transaction.status === 'completed'
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : transaction.status === 'pending'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}
            >
              {getStatusIcon(transaction.status)}
            </div>
            <div>
              <DialogTitle className="text-lg">
                {getTypeLabel(transaction.type)}
              </DialogTitle>
              <DialogDescription>
                Transaction ID: {transaction.id}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount */}
          <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-900/50">
            <div className="flex items-center justify-center gap-2">
              {getTypeIcon(transaction.type)}
              <span className="text-3xl font-bold">
                {transaction.amount}
              </span>
              <span className="text-xl text-gray-500">{transaction.token}</span>
            </div>
            <Badge className={`mt-2 ${getStatusBadge(transaction.status)}`}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </Badge>
          </div>

          {/* Details grid */}
          <div className="grid gap-3">
            {/* Transaction hash */}
            <DetailRow
              icon={<Hash className="h-4 w-4" />}
              label="Transaction Hash"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">
                  {formatAddress(transaction.hash)}
                </span>
                <button
                  onClick={() => copyToClipboard(transaction.hash, 'hash')}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {copiedField === 'hash' ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                {onViewOnExplorer && (
                  <button
                    onClick={() => onViewOnExplorer(transaction.hash)}
                    className="text-gray-400 hover:text-purple-500"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </DetailRow>

            <Separator />

            {/* From */}
            <DetailRow
              icon={<ArrowDownLeft className="h-4 w-4 text-green-500" />}
              label="From"
            >
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <span className="font-mono text-sm">
                  {formatAddress(transaction.from)}
                </span>
                <button
                  onClick={() => copyToClipboard(transaction.from, 'from')}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {copiedField === 'from' ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </DetailRow>

            {/* To */}
            <DetailRow
              icon={<ArrowUpRight className="h-4 w-4 text-blue-500" />}
              label="To"
            >
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <span className="font-mono text-sm">
                  {formatAddress(transaction.to)}
                </span>
                <button
                  onClick={() => copyToClipboard(transaction.to, 'to')}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {copiedField === 'to' ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </DetailRow>

            <Separator />

            {/* Product */}
            {transaction.productName && (
              <DetailRow
                icon={<Package className="h-4 w-4" />}
                label="Product"
              >
                <span className="text-sm">{transaction.productName}</span>
              </DetailRow>
            )}

            {/* Amount detail */}
            <DetailRow
              icon={<DollarSign className="h-4 w-4" />}
              label="Amount"
            >
              <span className="font-medium">
                {transaction.amount} {transaction.token}
              </span>
            </DetailRow>

            {/* Fee */}
            <DetailRow
              icon={<DollarSign className="h-4 w-4 text-gray-400" />}
              label="Network Fee"
            >
              <span className="text-sm text-gray-500">
                {transaction.fee} {transaction.token}
              </span>
            </DetailRow>

            <Separator />

            {/* Date */}
            <DetailRow
              icon={<Calendar className="h-4 w-4" />}
              label="Date"
            >
              <span className="text-sm">{transaction.timestamp}</span>
            </DetailRow>

            {/* Block */}
            <DetailRow
              icon={<Hash className="h-4 w-4 text-gray-400" />}
              label="Block Number"
            >
              <span className="text-sm">{transaction.blockNumber}</span>
            </DetailRow>

            {/* Confirmations */}
            <DetailRow
              icon={<Check className="h-4 w-4 text-green-400" />}
              label="Confirmations"
            >
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                {transaction.confirmations} blocks
              </Badge>
            </DetailRow>

            {/* Network */}
            <DetailRow
              icon={<ExternalLink className="h-4 w-4 text-gray-400" />}
              label="Network"
            >
              <span className="text-sm">{transaction.network}</span>
            </DetailRow>
          </div>

          {/* Notes */}
          {transaction.notes && (
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
              <p className="text-xs font-medium text-gray-500">Notes</p>
              <p className="mt-1 text-sm">{transaction.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Detail row sub-component
function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div>{children}</div>
    </div>
  )
}