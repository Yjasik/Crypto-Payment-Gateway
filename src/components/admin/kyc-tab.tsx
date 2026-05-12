'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
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
  Check,
  X,
  Eye,
  Clock,
  FileCheck,
  FileText,
  User,
  Calendar,
  AlertCircle,
  Shield,
} from 'lucide-react'

// KYC application type
interface KycApplication {
  id: string
  userId: string
  userName: string
  email: string
  documentType: string
  documentUrl: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
}

// Mock KYC applications
const mockKycApplications: KycApplication[] = [
  {
    id: 'kyc_001',
    userId: 'user_002',
    userName: 'Crypto Academy',
    email: 'academy@example.com',
    documentType: 'Passport',
    documentUrl: 'ipfs://QmXx...xx/kyc_passport.pdf',
    submittedAt: '2026-05-11 14:30',
    status: 'pending',
  },
  {
    id: 'kyc_002',
    userId: 'user_005',
    userName: 'Web3 Store',
    email: 'store@example.com',
    documentType: 'Driver License',
    documentUrl: 'ipfs://QmYy...yy/kyc_license.pdf',
    submittedAt: '2026-05-10 10:15',
    status: 'pending',
  },
  {
    id: 'kyc_003',
    userId: 'user_007',
    userName: 'Token Launchpad',
    email: 'token@example.com',
    documentType: 'ID Card',
    documentUrl: 'ipfs://QmZz...zz/kyc_id.pdf',
    submittedAt: '2026-05-09 16:45',
    status: 'pending',
  },
  {
    id: 'kyc_004',
    userId: 'user_001',
    userName: 'NFT Gallery',
    email: 'nft@example.com',
    documentType: 'Passport',
    documentUrl: 'ipfs://QmAa...aa/kyc_passport.pdf',
    submittedAt: '2026-05-05 09:00',
    status: 'approved',
    reviewedBy: 'admin_001',
    reviewedAt: '2026-05-06 11:30',
    notes: 'All documents verified successfully',
  },
  {
    id: 'kyc_005',
    userId: 'user_003',
    userName: 'DeFi Trader',
    email: 'trader@example.com',
    documentType: 'Driver License',
    documentUrl: 'ipfs://QmBb...bb/kyc_license.pdf',
    submittedAt: '2026-04-20 12:00',
    status: 'rejected',
    reviewedBy: 'admin_001',
    reviewedAt: '2026-04-21 10:00',
    notes: 'Document expired. Please upload a valid document.',
  },
]

export function KycTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>('pending')
  const [selectedApp, setSelectedApp] = useState<KycApplication | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')

  // Format address
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  // Filter applications
  const filteredApplications = mockKycApplications.filter((app) => {
    const matchesSearch =
      searchQuery === '' ||
      app.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.documentType.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = !statusFilter || statusFilter === 'all' || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Status badge
  const getStatusBadge = (status: KycApplication['status']) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
    }
    return variants[status]
  }

  // Handle review action
  const handleReviewAction = (action: 'approved' | 'rejected') => {
    if (!selectedApp) return
    console.log(`KYC ${action}: ${selectedApp.id}`, { notes: reviewNotes })
    setIsReviewOpen(false)
    setReviewNotes('')
  }

  // Count stats
  const pendingCount = mockKycApplications.filter((a) => a.status === 'pending').length
  const approvedCount = mockKycApplications.filter((a) => a.status === 'approved').length
  const rejectedCount = mockKycApplications.filter((a) => a.status === 'rejected').length

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                <p className="text-xs text-gray-500">Pending Review</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                <p className="text-xs text-gray-500">Approved</p>
              </div>
              <Check className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
                <p className="text-xs text-gray-500">Rejected</p>
              </div>
              <X className="h-8 w-8 text-red-500 opacity-50" />
            </div>
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
                placeholder="Search by name, email, or document type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status filter */}
            <Select value={statusFilter ?? 'pending'} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications list */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Applications ({filteredApplications.length})</CardTitle>
          <CardDescription>
            Review and process verification requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileCheck className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                All KYC applications have been processed
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    {/* User avatar */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      {app.userName.charAt(0)}
                    </div>

                    {/* App info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{app.userName}</p>
                        <Badge className={getStatusBadge(app.status)}>
                          {app.status}
                        </Badge>
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {app.documentType}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {app.submittedAt}
                        </span>
                        {app.reviewedBy && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Reviewed by {formatAddress(app.reviewedBy)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedApp(app)
                        setIsReviewOpen(true)
                      }}
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      Review
                    </Button>
                    {app.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedApp(app)
                            handleReviewAction('approved')
                          }}
                        >
                          <Check className="mr-1 h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedApp(app)
                            setIsReviewOpen(true)
                          }}
                        >
                          <X className="mr-1 h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Review KYC Application</DialogTitle>
            <DialogDescription>
              Review submitted documents and approve or reject the application
            </DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              {/* User info */}
              <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-lg font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  {selectedApp.userName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold">{selectedApp.userName}</h4>
                  <p className="text-sm text-gray-500">{selectedApp.email}</p>
                </div>
              </div>

              {/* Document info */}
              <div className="grid gap-2">
                <Label className="text-sm text-gray-500">Document Type</Label>
                <p className="font-medium">{selectedApp.documentType}</p>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm text-gray-500">Document URL</Label>
                <p className="font-mono text-xs text-purple-600 dark:text-purple-400">
                  {selectedApp.documentUrl}
                </p>
                <Button variant="outline" size="sm" className="w-fit">
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  View Document
                </Button>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm text-gray-500">Submitted</Label>
                <p className="text-sm">{selectedApp.submittedAt}</p>
              </div>

              {/* Review form */}
              <div className="grid gap-2">
                <Label htmlFor="reviewNotes">Review Notes</Label>
                <textarea
                  id="reviewNotes"
                  className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
                  placeholder="Add notes about this application..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>

              {/* Security notice */}
              <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-900/50">
                <Shield className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  Documents are stored securely on IPFS. Your review decision will
                  be logged and cannot be undone.
                </span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReviewAction('rejected')}
            >
              <X className="mr-2 h-4 w-4" />
              Reject Application
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleReviewAction('approved')}
            >
              <Check className="mr-2 h-4 w-4" />
              Approve Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}