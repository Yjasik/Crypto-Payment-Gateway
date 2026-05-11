// src/app/(dashboard)/settings/page.tsx — Merchant settings page
'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  Save,
  Globe,
  Link as LinkIcon,
  Shield,
  Key,
  User,
  Store,
} from 'lucide-react'

// Mock API keys
const mockApiKeys = [
  {
    id: 'key_001',
    name: 'Production Key',
    key: 'cpk_live_xxxxxxxxxxxxx',
    secret: 'cps_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    createdAt: '2026-05-01',
    lastUsed: '2026-05-07',
    status: 'active',
  },
  {
    id: 'key_002',
    name: 'Test Key',
    key: 'cpk_test_xxxxxxxxxxxxx',
    secret: 'cps_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    createdAt: '2026-04-15',
    lastUsed: '2026-05-06',
    status: 'active',
  },
]

export default function SettingsPage() {
  const { isConnected, address } = useAccount()
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Profile form state
  const [profile, setProfile] = useState({
    merchantName: 'Crypto Merchant',
    email: 'merchant@example.com',
    website: 'https://merchant.com',
    webhookUrl: 'https://merchant.com/webhooks/crypto',
  })

  // Format address
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(null), 2000)
  }

  // Toggle secret visibility
  const toggleSecret = (keyId: string) => {
    setShowSecret((prev) => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  // Save settings
  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1500)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your merchant profile and API keys
        </p>
      </div>

      {/* Settings tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="api-keys">
            <Key className="mr-2 h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <LinkIcon className="mr-2 h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Merchant Profile</CardTitle>
              <CardDescription>
                Update your merchant information visible to customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Wallet address */}
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-gray-500">Connected Wallet</Label>
                    <p className="mt-1 font-mono text-sm">
                      {isConnected ? address : 'Not connected'}
                    </p>
                  </div>
                  {isConnected && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                      <Shield className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Merchant name */}
              <div className="grid gap-2">
                <Label htmlFor="merchantName">Merchant Name</Label>
                <Input
                  id="merchantName"
                  value={profile.merchantName}
                  onChange={(e) =>
                    setProfile({ ...profile, merchantName: e.target.value })
                  }
                />
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
              </div>

              {/* Website */}
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://"
                  value={profile.website}
                  onChange={(e) =>
                    setProfile({ ...profile, website: e.target.value })
                  }
                />
              </div>

              <Separator />

              {/* Save button */}
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Manage API keys for programmatic access to the payment gateway
                </CardDescription>
              </div>
              <Button>
                <Key className="mr-2 h-4 w-4" />
                Generate New Key
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isConnected ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Key className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-semibold">Connect your wallet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Connect your wallet to manage API keys
                  </p>
                </div>
              ) : (
                mockApiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        {/* Key name */}
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{apiKey.name}</h4>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                            {apiKey.status}
                          </Badge>
                        </div>

                        {/* Public key */}
                        <div>
                          <Label className="text-xs text-gray-500">Public Key</Label>
                          <div className="mt-1 flex items-center gap-2">
                            <code className="flex-1 rounded bg-gray-50 px-2 py-1 font-mono text-xs dark:bg-gray-900">
                              {apiKey.key}
                            </code>
                            <button
                              onClick={() => copyToClipboard(apiKey.key)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {copiedText === apiKey.key ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Secret key */}
                        <div>
                          <Label className="text-xs text-gray-500">Secret Key</Label>
                          <div className="mt-1 flex items-center gap-2">
                            <code className="flex-1 rounded bg-gray-50 px-2 py-1 font-mono text-xs dark:bg-gray-900">
                              {showSecret[apiKey.id]
                                ? apiKey.secret
                                : apiKey.secret.slice(0, 12) + '••••••••••••••'}
                            </code>
                            <button
                              onClick={() => toggleSecret(apiKey.id)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {showSecret[apiKey.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => copyToClipboard(apiKey.secret)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {copiedText === apiKey.secret ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>Created: {apiKey.createdAt}</span>
                          <span>Last used: {apiKey.lastUsed}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Receive real-time notifications for payment events on your server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  placeholder="https://your-server.com/webhooks/crypto"
                  value={profile.webhookUrl}
                  onChange={(e) =>
                    setProfile({ ...profile, webhookUrl: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500">
                  We&apos;ll send POST requests with payment event data to this URL
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                <h4 className="mb-2 text-sm font-medium">Supported Events</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">payment.received</Badge>
                    <span className="text-gray-500">When a payment is confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">payment.failed</Badge>
                    <span className="text-gray-500">When a payment fails</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">payout.completed</Badge>
                    <span className="text-gray-500">When a payout is processed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">product.created</Badge>
                    <span className="text-gray-500">When a new product is added</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Webhook'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage security preferences for your merchant account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payout address */}
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Payout Address</h4>
                    <p className="mt-0.5 text-sm text-gray-500">
                      All withdrawals will be sent to your connected wallet
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                    Active
                  </Badge>
                </div>
              </div>

              {/* Two-factor */}
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </div>

              {/* Transaction signing */}
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Transaction Confirmation</h4>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Require wallet signature for every payout
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}