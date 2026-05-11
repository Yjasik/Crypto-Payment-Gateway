'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  Filter,
  Eye,
  UserCheck,
  UserX,
  Shield,
  Users,
  Mail,
  Calendar,
  DollarSign,
  ArrowLeftRight,
  Clock,
  AlertCircle,
} from 'lucide-react'

// User type
interface User {
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
  lastActive: string
}

// Mock users
const mockUsers: User[] = [
  {
    id: 'user_001',
    address: '0x1234567890123456789012345678901234567890',
    name: 'NFT Gallery',
    email: 'nft@example.com',
    role: 'merchant',
    status: 'active',
    kycStatus: 'verified',
    joinedAt: '2026-04-15',
    totalRevenue: '$45,200',
    transactionCount: 302,
    lastActive: '2026-05-11 10:30',
  },
  {
    id: 'user_002',
    address: '0x8765432109876543210987654321098765432109',
    name: 'Crypto Academy',
    email: 'academy@example.com',
    role: 'merchant',
    status: 'active',
    kycStatus: 'pending',
    joinedAt: '2026-05-01',
    totalRevenue: '$12,800',
    transactionCount: 120,
    lastActive: '2026-05-11 09:15',
  },
  {
    id: 'user_003',
    address: '0x9876543210987654321098765432109876543210',
    name: 'DeFi Trader',
    email: 'trader@example.com',
    role: 'merchant',
    status: 'suspended',
    kycStatus: 'rejected',
    joinedAt: '2026-03-20',
    totalRevenue: '$2,400',
    transactionCount: 15,
    lastActive: '2026-05-01 14:00',
  },
  {
    id: 'user_004',
    address: '0x5678901234567890123567890123456789012345',
    name: 'Web3 Store',
    email: 'store@example.com',
    role: 'merchant',
    status: 'active',
    kycStatus: 'verified',
    joinedAt: '2026-02-10',
    totalRevenue: '$89,500',
    transactionCount: 650,
    lastActive: '2026-05-11 11:00',
  },
  {
    id: 'user_005',
    address: '0x3456789012345678901234567890123456789012',
    name: 'Token Launchpad',
    email: 'token@example.com',
    role: 'merchant',
    status: 'pending',
    kycStatus: 'not_started',
    joinedAt: '2026-05-10',
    totalRevenue: '$0',
    transactionCount: 0,
    lastActive: '2026-05-10 16:45',
  },
  {
    id: 'admin_001',
    address: '0x0123456789012345678901234567890123456789',
    name: 'Platform Admin',
    email: 'admin@cryptopay.com',
    role: 'admin',
    status: 'active',
    kycStatus: 'verified',
    joinedAt: '2026-01-01',
    totalRevenue: '$0',
    transactionCount: 0,
    lastActive: '2026-05-11 11:30',
  },
]

export default function UsersPage() {
  const { isConnected } = useAccount()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>('all')
  const [roleFilter, setRoleFilter] = useState<string | null>('all')
  const [kycFilter, setKycFilter] = useState<string | null>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

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
    const matchesRole = !roleFilter || roleFilter === 'all' || user.role === roleFilter
    const matchesKyc = !kycFilter || kycFilter === 'all' || user.kycStatus === kycFilter

    return matchesSearch && matchesStatus && matchesRole && matchesKyc
  })

  // Status badge
  const getStatusBadge = (status: User['status']) => {
    const variants = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
    }
    return variants[status]
  }

  // KYC status badge
  const getKycBadge = (status: User['kycStatus']) => {
    const variants = {
      verified: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
      not_started: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    }
    return variants[status]
  }

  // Role badge
  const getRoleBadge = (role: User['role']) => {
    return role === 'admin'
      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  }

  // Handle user action
  const handleToggleStatus = (user: User) => {
    console.log(
      `Toggle status for ${user.name}: ${user.status === 'active' ? 'suspend' : 'activate'}`
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Users</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Manage all platform users, merchants, and administrators
        </p>
      </div>

      {!isConnected ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold">Connect admin wallet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Connect your admin wallet to manage users
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Quick stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{mockUsers.length}</div>
                <p className="text-xs text-gray-500">Total Users</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {mockUsers.filter((u) => u.status === 'active').length}
                </div>
                <p className="text-xs text-gray-500">Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">
                  {mockUsers.filter((u) => u.kycStatus === 'pending').length}
                </div>
                <p className="text-xs text-gray-500">KYC Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">
                  {mockUsers.filter((u) => u.status === 'suspended').length}
                </div>
                <p className="text-xs text-gray-500">Suspended</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or wallet..."
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
                  <SelectTrigger className="w-[130px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                {/* Role filter */}
                <Select value={roleFilter ?? 'all'} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="merchant">Merchant</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>

                {/* KYC filter */}
                <Select value={kycFilter ?? 'all'} onValueChange={setKycFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="KYC" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All KYC</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users table */}
          <Card>
            <CardHeader>
              <CardTitle>All Users ({filteredUsers.length})</CardTitle>
              <CardDescription>
                Click on a user to view details or manage their account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
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
                      <TableHead>KYC</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        {/* User info */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Wallet */}
                        <TableCell className="font-mono text-xs">
                          {formatAddress(user.address)}
                        </TableCell>

                        {/* Role */}
                        <TableCell>
                          <Badge className={getRoleBadge(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>

                        {/* KYC */}
                        <TableCell>
                          <Badge className={getKycBadge(user.kycStatus)}>
                            {user.kycStatus.replace('_', ' ')}
                          </Badge>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge className={getStatusBadge(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>

                        {/* Revenue */}
                        <TableCell className="font-medium">
                          {user.totalRevenue}
                        </TableCell>

                        {/* Joined */}
                        <TableCell className="text-sm text-gray-500">
                          {user.joinedAt}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedUser(user)
                                setIsViewOpen(true)
                              }}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleStatus(user)}
                              title={
                                user.status === 'active'
                                  ? 'Suspend user'
                                  : 'Activate user'
                              }
                            >
                              {user.status === 'active' ? (
                                <UserX className="h-4 w-4 text-red-500" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* User details dialog */}
          <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>
                  Detailed information about this user
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-4">
                  {/* Avatar and name */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-xl font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      {selectedUser.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Mail className="h-3.5 w-3.5" />
                        {selectedUser.email}
                      </div>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Wallet</span>
                      <span className="font-mono text-xs">
                        {formatAddress(selectedUser.address)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Role</span>
                      <Badge className={getRoleBadge(selectedUser.role)}>
                        {selectedUser.role}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Status</span>
                      <Badge className={getStatusBadge(selectedUser.status)}>
                        {selectedUser.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">KYC Status</span>
                      <Badge className={getKycBadge(selectedUser.kycStatus)}>
                        {selectedUser.kycStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        <DollarSign className="mr-1 inline h-3.5 w-3.5" />
                        Total Revenue
                      </span>
                      <span className="font-medium">{selectedUser.totalRevenue}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        <ArrowLeftRight className="mr-1 inline h-3.5 w-3.5" />
                        Transactions
                      </span>
                      <span className="font-medium">
                        {selectedUser.transactionCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        <Calendar className="mr-1 inline h-3.5 w-3.5" />
                        Joined
                      </span>
                      <span>{selectedUser.joinedAt}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        <Clock className="mr-1 inline h-3.5 w-3.5" />
                        Last Active
                      </span>
                      <span>{selectedUser.lastActive}</span>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
                {selectedUser && selectedUser.status === 'active' ? (
                  <Button variant="destructive">
                    <UserX className="mr-2 h-4 w-4" />
                    Suspend User
                  </Button>
                ) : (
                  <Button className="bg-green-600 hover:bg-green-700">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate User
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}