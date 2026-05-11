// src/app/(dashboard)/payouts/page.tsx — Payout management page
'use client'

import { useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowUpRight,
  Wallet,
  Clock,
  History,
  Filter,
} from 'lucide-react'

// Payout type definition
interface Payout {
  id: string
  amount: string
  token: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  txHash?: string
  requestedAt: string
  completedAt?: string
  fee: string
  netAmount: string
}

// Mock payout history
const mockPayouts: Payout[] = [
  {
    id: 'po_001',
    amount: '500.00',
    token: 'USDC',
    status: 'completed',
    txHash: '0xabcd...ef01',
    requestedAt: '2026-05-06 10:00',
    completedAt: '2026-05-06 10:15',
    fee: '2.50',
    netAmount: '497.50',
  },
  {
    id: 'po_002',
    amount: '0.25',
    token: 'ETH',
    status: 'processing',
    requestedAt: '2026-05-07 09:30',
    fee: '0.00125',
    netAmount: '0.24875',
  },
  {
    id: 'po_003',
    amount: '1000.00',
    token: 'USDT',
    status: 'pending',
    requestedAt: '2026-05-07 11:00',
    fee: '5.00',
    netAmount: '995.00',
  },
]

export default function PayoutsPage() {
  const { isConnected, address } = useAccount()
  const { data: balance } = useBalance({ address })
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutToken, setPayoutToken] = useState<string | null>('USDC')
  const [statusFilter, setStatusFilter] = useState<string | null>('all')

  // Format address
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  // Filter payouts
  const filteredPayouts = mockPayouts.filter((payout) => {
    return !statusFilter || statusFilter === 'all' || payout.status === statusFilter
  })

  // Status badge styling
  const getStatusBadge = (status: Payout['status']) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
    }
    return variants[status]
  }

  // Handle payout request
  const handlePayoutRequest = () => {
    console.log('Requesting payout:', { amount: payoutAmount, token: payoutToken })
    // TODO: Call ContractService.withdrawFunds()
    setIsCreateOpen(false)
    setPayoutAmount('')
  }

  // Calculate fee (0.5%)
  const calculateFee = (amount: string) => {
    const num = parseFloat(amount || '0')
    return (num * 0.005).toFixed(2)
  }

  // Calculate net amount
  const calculateNet = (amount: string) => {
    const num = parseFloat(amount || '0')
    const fee = num * 0.005
    return (num - fee).toFixed(2)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payouts</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Withdraw your earnings to your wallet
          </p>
        </div>

        {/* Request payout button */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
           <ArrowUpRight className="h-4 w-4" />
            Request Payout
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Request Payout</DialogTitle>
              <DialogDescription>
                Withdraw your available balance to your connected wallet.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Available balance */}
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Available Balance</span>
                  <span className="font-medium">
                    {isConnected && balance
                      ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}`
                      : '$0.00'}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                />
              </div>

              {/* Token */}
              <div className="grid gap-2">
                <Label htmlFor="token">Token</Label>
                <Select value={payoutToken ?? 'USDC'} onValueChange={setPayoutToken}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDC">💲 USDC</SelectItem>
                    <SelectItem value="USDT">💵 USDT</SelectItem>
                    <SelectItem value="ETH">🔷 ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fee summary */}
              {payoutToken && payoutAmount && (
                <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount</span>
                      <span>${payoutAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Platform Fee (0.5%)</span>
                      <span>${calculateFee(payoutAmount)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 font-medium">
                      <span>You receive</span>
                      <span className="text-green-600">${calculateNet(payoutAmount)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePayoutRequest} disabled={!payoutAmount}>
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Request Payout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Available Balance
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
              Ready to withdraw
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Withdrawn
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,500.25</div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Lifetime withdrawals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payout history */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payout History</CardTitle>
            <CardDescription>Your recent withdrawal requests</CardDescription>
          </div>
          <Select value={statusFilter ?? 'all'} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payouts</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wallet className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Connect your wallet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Connect your wallet to manage payouts
              </p>
            </div>
          ) : filteredPayouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    No payouts yet
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Request your first payout to withdraw earnings
                </p>
                <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Request Payout
                </Button>
                </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payout ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead className="text-right">TX Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-mono text-xs">
                      {payout.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {payout.amount} {payout.token}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {payout.fee} {payout.token}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {payout.netAmount} {payout.token}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(payout.status)}>
                        {payout.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {payout.requestedAt}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {payout.completedAt || <Clock className="h-3.5 w-3.5 text-gray-400" />}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {payout.txHash ? (
                        <span className="text-purple-600 dark:text-purple-400">
                          {formatAddress(payout.txHash)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
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