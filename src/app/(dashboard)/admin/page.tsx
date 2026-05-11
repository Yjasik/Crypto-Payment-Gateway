'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { StatsCard } from '@/components/dashboard/stats-cards'
import { TransactionTable } from '@/components/transactions/transaction-table'
import type { Transaction } from '@/components/transactions/transaction-table'
import {
  Shield,
  Users,
  DollarSign,
  Activity,
  ArrowUpRight,
  Search,
  Filter,
  Check,
  X,
  Eye,
  Clock,
  AlertCircle,
  FileCheck,
  UserCheck,
  UserX,
  Settings,
  BarChart3,
  Wallet,
} from 'lucide-react'

// User type for admin
interface AdminUser {
  id: string
  address: string
  name: string
  email: string
  role: 'merchant' | 'admin'
  status: 'active' | 'suspended' | 'pending'
  kycStatus: 'verified' | 'pending' | 'rejected' | 'not_started'
  joinedAt: string
  totalRevenue: string
  transactionCount: number
}

// KYC application type
interface KycApplication {
  id: string
  userId: string
  userName: string
  documentType: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

// Mock users
const mockUsers: AdminUser[] = [
  {
    id: 'user_001',
    address: '0x1234...5678',
    name: 'NFT Gallery',
    email: 'nft@example.com',
    role: 'merchant',
    status: 'active',
    kycStatus: 'verified',
    joinedAt: '2026-04-15',
    totalRevenue: '$45,200',
    transactionCount: 302,
  },
  {
    id: 'user_002',
    address: '0x8765...4321',
    name: 'Crypto Academy',
    email: 'academy@example.com',
    role: 'merchant',
    status: 'active',
    kycStatus: 'pending',
    joinedAt: '2026-05-01',
    totalRevenue: '$12,800',
    transactionCount: 120,
  },
  {
    id: 'user_003',
    address: '0x9876...5432',
    name: 'DeFi Trader',
    email: 'trader@example.com',
    role: 'merchant',
    status: 'suspended',
    kycStatus: 'rejected',
    joinedAt: '2026-03-20',
    totalRevenue: '$2,400',
    transactionCount: 15,
  },
]

// Mock KYC applications
const mockKycApplications: KycApplication[] = [
  {
    id: 'kyc_001',
    userId: 'user_002',
    userName: 'Crypto Academy',
    documentType: 'Passport',
    submittedAt: '2026-05-07 14:30',
    status: 'pending',
  },
  {
    id: 'kyc_002',
    userId: 'user_005',
    userName: 'Web3 Store',
    documentType: 'Driver License',
    submittedAt: '2026-05-06 10:15',
    status: 'pending',
  },
  {
    id: 'kyc_003',
    userId: 'user_007',
    userName: 'Token Launchpad',
    documentType: 'ID Card',
    submittedAt: '2026-05-05 16:45',
    status: 'pending',
  },
]

// Mock admin transactions
const adminTransactions: Transaction[] = [
  {
    id: 'tx_001',
    hash: '0xabcd...ef01',
    type: 'payment',
    amount: '150.00',
    token: 'USDC',
    from: '0x1234...5678',
    to: '0x8765...4321',
    status: 'completed',
    timestamp: '2026-05-07 14:30',
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
    timestamp: '2026-05-07 13:15',
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
    timestamp: '2026-05-07 12:00',
  },
]

export default function AdminPage() {
  const { isConnected, address } = useAccount()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>('all')
  const [selectedKycApp, setSelectedKycApp] = useState<KycApplication | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  // Format address
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  // Filter users
  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      searchQuery === '' ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = !statusFilter || statusFilter === 'all' || user.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Status badge for users
  const getUserStatusBadge = (status: AdminUser['status']) => {
    const variants = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
    }
    return variants[status]
  }

  // KYC status badge
  const getKycStatusBadge = (status: AdminUser['kycStatus']) => {
    const variants = {
      verified: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
      not_started: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    }
    return variants[status]
  }

  // Handle KYC review
  const handleKycAction = (appId: string, action: 'approved' | 'rejected') => {
    console.log(`KYC ${action}: ${appId}`)
    setSelectedKycApp(null)
    setIsReviewOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Panel</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Manage platform users, KYC, and transactions
        </p>
      </div>

      {!isConnected ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold">Connect admin wallet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Connect your admin wallet to access the panel
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Admin stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Users"
              value="156"
              icon={Users}
              description="+12 this month"
              trend="up"
            />
            <StatsCard
              title="Total Revenue"
              value="$156,789"
              icon={DollarSign}
              description="Platform earnings"
            />
            <StatsCard
              title="KYC Pending"
              value="8"
              icon={FileCheck}
              description="Awaiting review"
            />
            <StatsCard
              title="Active Merchants"
              value="142"
              icon={Activity}
              description="91% active rate"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">
                <BarChart3 className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="mr-2 h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="kyc">
                <FileCheck className="mr-2 h-4 w-4" />
                KYC Management
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="mr-2 h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Overview</CardTitle>
                  <CardDescription>Key metrics and recent activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionTable
                    transactions={adminTransactions}
                    showFilters={false}
                    compact={true}
                    showPagination={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                      Manage merchant accounts and permissions
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    {/* Status filter */}
                    <Select
                      value={statusFilter ?? 'all'}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[140px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Users className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                      <h3 className="text-lg font-semibold">No users found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Wallet</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>KYC Status</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {formatAddress(user.address)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getKycStatusBadge(user.kycStatus)}>
                                {user.kycStatus.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getUserStatusBadge(user.status)}>
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {user.totalRevenue}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {user.joinedAt}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {user.status === 'active' ? (
                                  <Button variant="ghost" size="icon">
                                    <UserX className="h-4 w-4 text-red-500" />
                                  </Button>
                                ) : (
                                  <Button variant="ghost" size="icon">
                                    <UserCheck className="h-4 w-4 text-green-500" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* KYC Management Tab */}
            <TabsContent value="kyc" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>KYC Applications</CardTitle>
                  <CardDescription>
                    Review and process verification requests ({mockKycApplications.length} pending)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {mockKycApplications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileCheck className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                      <h3 className="text-lg font-semibold">No pending applications</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        All KYC applications have been processed
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mockKycApplications.map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                              <FileCheck className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{app.userName}</p>
                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                                  <Clock className="mr-1 h-3 w-3" />
                                  Pending
                                </Badge>
                              </div>
                              <div className="mt-0.5 flex gap-3 text-xs text-gray-500">
                                <span>Document: {app.documentType}</span>
                                <span>Submitted: {app.submittedAt}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedKycApp(app)
                                setIsReviewOpen(true)
                              }}
                            >
                              <Eye className="mr-1 h-3.5 w-3.5" />
                              Review
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleKycAction(app.id, 'approved')}
                            >
                              <Check className="mr-1 h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleKycAction(app.id, 'rejected')}
                            >
                              <X className="mr-1 h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Activity</CardTitle>
                  <CardDescription>Recent actions and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionTable
                    transactions={adminTransactions}
                    showFilters={true}
                    showPagination={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}