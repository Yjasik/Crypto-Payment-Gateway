'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatsCard } from '@/components/dashboard/stats-cards'
import { TransactionTable } from '@/components/transactions/transaction-table'
import type { Transaction } from '@/components/transactions/transaction-table'
import {
  Users,
  DollarSign,
  Activity,
  FileCheck,
  TrendingUp,
  CreditCard,
  Wallet,
  BarChart3,
} from 'lucide-react'

// Mock platform stats
const platformStats = {
  totalUsers: 156,
  activeUsers: 142,
  totalRevenue: '$156,789',
  platformFees: '$7,839',
  kycPending: 8,
  kycApproved: 128,
  totalTransactions: 4523,
  avgTransactionValue: '$127.30',
  activeProducts: 235,
  avgRevenuePerMerchant: '$1,104',
}

// Mock admin transactions
const recentTransactions: Transaction[] = [
  {
    id: 'tx_001',
    hash: '0xabcd...ef01',
    type: 'payment',
    amount: '150.00',
    token: 'USDC',
    from: '0x1234...5678',
    to: '0x8765...4321',
    status: 'completed',
    timestamp: '2026-05-11 14:30',
    productName: 'Premium NFT',
  },
  {
    id: 'tx_002',
    hash: '0x2345...6789',
    type: 'payment',
    amount: '0.05',
    token: 'ETH',
    from: '0x9876...5432',
    to: '0x5678...9012',
    status: 'completed',
    timestamp: '2026-05-11 13:15',
    productName: 'DeFi Course',
  },
  {
    id: 'tx_003',
    hash: '0x3456...7890',
    type: 'payout',
    amount: '500.00',
    token: 'USDC',
    from: '0x3456...7890',
    to: '0x9012...3456',
    status: 'pending',
    timestamp: '2026-05-11 12:00',
  },
  {
    id: 'tx_004',
    hash: '0x4567...8901',
    type: 'payment',
    amount: '75.00',
    token: 'USDT',
    from: '0x5678...9012',
    to: '0x0123...4567',
    status: 'completed',
    timestamp: '2026-05-11 11:30',
    productName: 'Consulting Session',
  },
  {
    id: 'tx_005',
    hash: '0x5678...9012',
    type: 'refund',
    amount: '25.00',
    token: 'USDC',
    from: '0x6789...0123',
    to: '0x1234...5678',
    status: 'failed',
    timestamp: '2026-05-11 10:45',
  },
]

// Revenue data for chart
const weeklyRevenue = [
  { day: 'Mon', value: 4200 },
  { day: 'Tue', value: 3800 },
  { day: 'Wed', value: 5100 },
  { day: 'Thu', value: 4600 },
  { day: 'Fri', value: 5900 },
  { day: 'Sat', value: 3200 },
  { day: 'Sun', value: 2800 },
]

// Token distribution
const tokenDistribution = [
  { token: 'USDC', percentage: 52, color: 'bg-blue-500' },
  { token: 'ETH', percentage: 28, color: 'bg-purple-500' },
  { token: 'USDT', percentage: 20, color: 'bg-green-500' },
]

export function OverviewTab() {
  const maxRevenue = Math.max(...weeklyRevenue.map((d) => d.value))

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={String(platformStats.totalUsers)}
          description={`${platformStats.activeUsers} active (91%)`}
          icon={Users}
          trend="up"
        />
        <StatsCard
          title="Total Revenue"
          value={platformStats.totalRevenue}
          description={`Fees earned: ${platformStats.platformFees}`}
          icon={DollarSign}
        />
        <StatsCard
          title="Total Transactions"
          value={String(platformStats.totalTransactions)}
          description={`Avg: ${platformStats.avgTransactionValue}`}
          icon={Activity}
        />
        <StatsCard
          title="KYC Status"
          value={`${platformStats.kycApproved} approved`}
          description={`${platformStats.kycPending} pending review`}
          icon={FileCheck}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Revenue</CardTitle>
            <CardDescription>
              Platform revenue for the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-48">
              {weeklyRevenue.map((day) => (
                <div
                  key={day.day}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs font-medium text-gray-500">
                    ${day.value}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-purple-500 transition-all hover:bg-purple-600"
                    style={{
                      height: `${(day.value / maxRevenue) * 100}%`,
                      minHeight: '4px',
                    }}
                  />
                  <span className="text-xs text-gray-400">{day.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Token distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Transaction volume by token
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tokenDistribution.map((item) => (
              <div key={item.token} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-sm ${item.color}`} />
                    <span className="font-medium">{item.token}</span>
                  </div>
                  <span className="text-gray-500">{item.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Secondary metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Products
            </CardTitle>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.activeProducts}</div>
            <p className="mt-1 text-xs text-gray-500">Across all merchants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Avg Revenue/Merchant
            </CardTitle>
            <Wallet className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {platformStats.avgRevenuePerMerchant}
            </div>
            <p className="mt-1 text-xs text-green-600">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Platform Fees (0.5%)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.platformFees}</div>
            <p className="mt-1 text-xs text-gray-500">Total fees collected</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
          <CardDescription>
            Latest transactions across all merchants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionTable
            transactions={recentTransactions}
            showFilters={false}
            compact={false}
            showPagination={false}
          />
        </CardContent>
      </Card>
    </div>
  )
}