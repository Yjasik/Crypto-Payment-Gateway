'use client'

import { useState, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Upload,
  Check,
  Clock,
  AlertCircle,
  Shield,
  FileText,
  User,
  MapPin,
  Camera,
  FileCheck,
  ArrowUpRight,
  X,
  Loader2,
  ChevronRight,
} from 'lucide-react'

// KYC status type
type KycStatus = 'not_started' | 'pending' | 'approved' | 'rejected'

// KYC document type
interface KycDocument {
  id: string
  type: string
  fileName: string
  uploadedAt: string
  status: 'pending' | 'verified' | 'rejected'
}

// Verification level
interface VerificationLevel {
  level: number
  name: string
  limit: string
  requirements: string[]
  status: 'locked' | 'available' | 'active' | 'completed'
}

export default function KycPage() {
  const { isConnected, address } = useAccount()
  const [kycStatus, setKycStatus] = useState<KycStatus>('not_started')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    country: '',
    address: '',
    city: '',
    postalCode: '',
  })

  // Mock documents
  const [documents, setDocuments] = useState<KycDocument[]>([
    {
      id: 'doc_001',
      type: 'Passport',
      fileName: 'passport_scan.pdf',
      uploadedAt: '2026-05-07 14:30',
      status: 'pending',
    },
  ])

  // Verification levels
  const verificationLevels: VerificationLevel[] = [
    {
      level: 1,
      name: 'Basic',
      limit: '$1,000/day',
      requirements: ['Email verification', 'Phone number'],
      status: kycStatus === 'not_started' ? 'available' : 'completed',
    },
    {
      level: 2,
      name: 'Advanced',
      limit: '$10,000/day',
      requirements: ['ID document', 'Selfie with ID', 'Proof of address'],
      status:
        kycStatus === 'approved'
          ? 'active'
          : kycStatus === 'pending'
          ? 'available'
          : 'locked',
    },
    {
      level: 3,
      name: 'Enterprise',
      limit: 'Unlimited',
      requirements: ['Business registration', 'Bank statement', 'Compliance review'],
      status: 'locked',
    },
  ]

  // Format address
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  // Handle file upload
  const handleFileUpload = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const newFiles = Array.from(files)
      setUploadedFiles((prev) => [...prev, ...newFiles])
    },
    []
  )

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Submit KYC application
  const handleSubmitKyc = () => {
    setIsSubmitting(true)
    // Mock submission
    setTimeout(() => {
      setKycStatus('pending')
      setIsSubmitting(false)
    }, 2000)
  }

  // Status badge
  const getStatusBadge = (status: KycStatus) => {
    switch (status) {
      case 'not_started':
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
            Not Started
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
            <Clock className="mr-1 h-3 w-3" />
            Pending Review
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
            <Check className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">
            <AlertCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">KYC Verification</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Verify your identity to increase transaction limits
        </p>
      </div>

      {!isConnected ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold">Connect your wallet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Connect your wallet to start KYC verification
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Status banner */}
          {kycStatus === 'approved' && (
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-green-800 dark:text-green-300">
                    Verification Complete
                  </h4>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Your KYC has been approved. Transaction limits increased.
                  </p>
                </div>
              </div>
            </div>
          )}

          {kycStatus === 'pending' && (
            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                    Verification in Progress
                  </h4>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Your documents are being reviewed. This usually takes 1-3 business days.
                  </p>
                </div>
              </div>
            </div>
          )}

          {kycStatus === 'rejected' && (
            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">
                    Verification Rejected
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Your documents were not accepted. Please upload new documents.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Verification levels */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Levels</CardTitle>
              <CardDescription>
                Complete verification to unlock higher transaction limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationLevels.map((level) => (
                <div
                  key={level.level}
                  className={`rounded-lg border p-4 transition-colors ${
                    level.status === 'active'
                      ? 'border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/20'
                      : level.status === 'locked'
                      ? 'border-gray-200 bg-gray-50 opacity-60 dark:border-gray-800 dark:bg-gray-900/50'
                      : 'border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                          level.status === 'completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : level.status === 'active'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                        }`}
                      >
                        {level.status === 'completed' ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          level.level
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{level.name}</h4>
                        <p className="text-xs text-gray-500">
                          Limit: {level.limit}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {level.status === 'completed' && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                          Complete
                        </Badge>
                      )}
                      {level.status === 'active' && (
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          Current
                        </Badge>
                      )}
                      {level.status === 'locked' && (
                        <Badge className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                  {level.status !== 'locked' && (
                    <div className="mt-3 space-y-1">
                      {level.requirements.map((req) => (
                        <div
                          key={req}
                          className="flex items-center gap-2 text-xs text-gray-500"
                        >
                          <ChevronRight className="h-3 w-3" />
                          {req}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* KYC Form */}
          {kycStatus === 'not_started' || kycStatus === 'rejected' ? (
            <Card>
              <CardHeader>
                <CardTitle>Submit Verification</CardTitle>
                <CardDescription>
                  Provide your personal information and upload required documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData({ ...formData, dateOfBirth: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="United States"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Address */}
                <div>
                  <h4 className="mb-3 text-sm font-medium">Address</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        placeholder="123 Main Street"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        placeholder="10001"
                        value={formData.postalCode}
                        onChange={(e) =>
                          setFormData({ ...formData, postalCode: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Document upload */}
                <div>
                  <h4 className="mb-3 text-sm font-medium">Required Documents</h4>
                  <div className="space-y-3">
                    {/* Upload zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors ${
                        isDragging
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10'
                          : 'border-gray-300 hover:border-gray-400 dark:border-gray-700'
                      }`}
                    >
                      <Upload className="h-8 w-8 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          Drag and drop files here
                        </p>
                        <p className="text-xs text-gray-500">
                          or click to browse (PDF, JPG, PNG up to 10MB)
                        </p>
                      </div>
                      <label className="cursor-pointer">
                        <Button variant="outline" size="sm" type="button">
                          <FileText className="mr-2 h-4 w-4" />
                          Browse Files
                        </Button>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple
                          onChange={(e) => handleFileUpload(e.target.files)}
                        />
                      </label>
                    </div>

                    {/* Uploaded files list */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800"
                          >
                            <div className="flex items-center gap-3">
                              <FileCheck className="h-5 w-5 text-purple-500" />
                              <div>
                                <p className="text-sm font-medium">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div className="text-sm text-gray-500">
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        Your data is secure
                      </p>
                      <p>
                        Documents are encrypted and stored on IPFS via Pinata.
                        Only authorized compliance officers can access your data.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitKyc}
                    disabled={isSubmitting || uploadedFiles.length === 0}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Submit for Verification
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Pending documents */
            kycStatus === 'pending' && (
              <Card>
                <CardHeader>
                  <CardTitle>Submitted Documents</CardTitle>
                  <CardDescription>
                    Your documents are being reviewed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{doc.type}</p>
                            <p className="text-xs text-gray-500">{doc.fileName}</p>
                            <p className="text-xs text-gray-400">
                              Uploaded {doc.uploadedAt}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                          <Clock className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </>
      )}
    </div>
  )
}