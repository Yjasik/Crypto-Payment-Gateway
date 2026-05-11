'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatsCard } from '@/components/dashboard/stats-cards'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ArrowLeftRight,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  CreditCard,
  ArrowUpRight,
  Wallet,
  Clock
} from 'lucide-react'

// Mock analytics data
const revenueData = {
  today: '$1,245.00',
  weekly: '$8,432.50',
  monthly: '$32,150.75',
  total: '$156,789.00',
}

const transactionMetrics = {
  total: 1234,
  successful: 1187,
  failed: 45,
  pending: 2,
  successRate: '96.2%',
  avgValue: '$127.30',
}

const topProducts = [
  { name: 'Premium NFT Collection', revenue: '$45,200', sales: 302, trend: 'up' },
  { name: 'DeFi Course Access', revenue: '$32,800', sales: 650, trend: 'up' },
  { name: 'Consulting Session', revenue: '$18,500', sales: 45, trend: 'down' },
  { name: 'Token Presale Access', revenue: '$12,300', sales: 120, trend: 'up' },
]

const tokenBreakdown = [
  { token: 'USDC', percentage: 45, amount: '$70,555', color: 'bg-blue-500' },
  { token: 'ETH', percentage: 30, amount: '$47,037', color: 'bg-purple-500' },
  { token: 'USDT', percentage: 25, amount: '$39,197', color: 'bg-green-500' },
]

const dailyRevenue = [
  { day: 'Mon', value: 1250 },
  { day: 'Tue', value: 2100 },
  { day: 'Wed', value: 1800 },
  { day: 'Thu', value: 2900 },
  { day: 'Fri', value: 2400 },
  { day: 'Sat', value: 1500 },
  { day: 'Sun', value: 1100 },
]

const geographyData = [
  { country: 'United States', percentage: 35, flag: '🇺🇸' },
  { country: 'Germany', percentage: 20, flag: '🇩🇪' },
  { country: 'Japan', percentage: 15, flag: '🇯🇵' },
  { country: 'Brazil', percentage: 10, flag: '🇧🇷' },
  { country: 'United Kingdom', percentage: 8, flag: '🇬🇧' },
  { country: 'Others', percentage: 12, flag: '🌍' },
]

export default function AnalyticsPage() {
  const { isConnected } = useAccount()
  const [period, setPeriod] = useState<string | null>('weekly')

  // Max value for chart scaling
  const maxRevenue = Math.max(...dailyRevenue.map((d) => d.value))

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Track your payment performance and customer insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period ?? 'weekly'} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Today</SelectItem>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="yearly">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {!isConnected ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Connect your wallet
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Connect your wallet to view analytics
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Revenue overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Today's Revenue"
              value={revenueData.today}
              icon={DollarSign}
            />
            <StatsCard
              title="Weekly Revenue"
              value={revenueData.weekly}
              icon={TrendingUp}
              trend="up"
            />
            <StatsCard
              title="Monthly Revenue"
              value={revenueData.monthly}
              icon={BarChart3}
              trend="up"
            />
            <StatsCard
              title="Total Revenue"
              value={revenueData.total}
              icon={Activity}
            />
          </div>

          {/* Charts section */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue for this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-48">
                  {dailyRevenue.map((day) => (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
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

            {/* Token breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Revenue by token</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tokenBreakdown.map((item) => (
                  <div key={item.token} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-sm ${item.color}`} />
                        <span className="font-medium">{item.token}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{item.percentage}%</span>
                        <span className="font-medium">{item.amount}</span>
                      </div>
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

          {/* Transaction metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Success Rate
                </CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {transactionMetrics.successRate}
                </div>
                <div className="mt-2 flex gap-2 text-xs">
                  <span className="text-green-600">
                    {transactionMetrics.successful} successful
                  </span>
                  <span className="text-red-600">
                    {transactionMetrics.failed} failed
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Average Transaction
                </CardTitle>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactionMetrics.avgValue}</div>
                <p className="mt-1 text-xs text-gray-500">
                  Based on {transactionMetrics.total} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Pending
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {transactionMetrics.pending}
                </div>
                <p className="mt-1 text-xs text-gray-500">Awaiting confirmation</p>
              </CardContent>
            </Card>
          </div>

          {/* Bottom section */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best performing by revenue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          {product.sales} sales
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-sm font-medium">{product.revenue}</span>
                      {product.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Geography */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Geography</CardTitle>
                <CardDescription>Payments by country</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {geographyData.map((item) => (
                  <div
                    key={item.country}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.flag}</span>
                      <span className="text-sm font-medium">{item.country}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-2 rounded-full bg-purple-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-10 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
