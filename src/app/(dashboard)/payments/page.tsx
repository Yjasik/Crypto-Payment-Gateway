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
  CreditCard,
  Wallet,
  QrCode,
  Copy,
  Check,
  Send,
  ArrowDownLeft,
  Clock,
  ExternalLink,
  User,
  DollarSign,
} from 'lucide-react'

export default function PaymentsPage() {
  const { isConnected, address } = useAccount()
  const { data: balance } = useBalance({ address })
  const [recipientAddress, setRecipientAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState<string | null>('USDC')
  const [isSending, setIsSending] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  // Format address
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(null), 2000)
  }

  // Handle payment
  const handleSendPayment = () => {
    if (!recipientAddress || !amount) return
    setIsSending(true)

    // Mock payment processing
    setTimeout(() => {
      setTxHash('0x' + Math.random().toString(16).slice(2, 42))
      setIsSending(false)
    }, 3000)
  }

  // Reset form
  const handleReset = () => {
    setRecipientAddress('')
    setAmount('')
    setTxHash(null)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Send quick payments to any wallet address
        </p>
      </div>

      {!isConnected ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Wallet className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold">Connect your wallet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Connect your wallet to send payments
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Wallet balance */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Your Balance
                </CardTitle>
                <Wallet className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {balance
                    ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}`
                    : '$0.00'}
                </div>
                <p className="mt-1 text-xs text-gray-500">Available to send</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Connected Wallet
                </CardTitle>
                <User className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">
                    {formatAddress(address!)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(address!)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {copiedText === address ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Your address</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Network
                </CardTitle>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">Sepolia</div>
                <p className="mt-1 text-xs text-gray-500">Testnet</p>
              </CardContent>
            </Card>
          </div>

          {/* Payment form */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Send Payment</CardTitle>
                <CardDescription>
                  Enter recipient address and amount to send
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recipient address */}
                <div className="grid gap-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input
                    id="recipient"
                    placeholder="0x..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Enter the wallet address of the recipient
                  </p>
                </div>

                {/* Amount */}
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="flex gap-3">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Select
                      value={selectedToken ?? 'USDC'}
                      onValueChange={setSelectedToken}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Token" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDC">💲 USDC</SelectItem>
                        <SelectItem value="USDT">💵 USDT</SelectItem>
                        <SelectItem value="ETH">🔷 ETH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {amount && (
                    <p className="text-xs text-gray-500">
                      ≈ ${parseFloat(amount).toFixed(2)} USD
                    </p>
                  )}
                </div>

                {/* Quick amount buttons */}
                <div>
                  <Label className="mb-2 block text-xs text-gray-500">
                    Quick Amount
                  </Label>
                  <div className="flex gap-2">
                    {['10', '50', '100', '500'].map((quick) => (
                      <Button
                        key={quick}
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(quick)}
                      >
                        ${quick}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Send button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSendPayment}
                  disabled={
                    isSending || !recipientAddress || !amount
                  }
                >
                  {isSending ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send {amount || '0'} {selectedToken}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Transaction status / QR */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {txHash ? 'Transaction Sent' : 'Payment Info'}
                </CardTitle>
                <CardDescription>
                  {txHash
                    ? 'Your transaction has been submitted'
                    : 'Review your payment details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {txHash ? (
                  <div className="flex flex-col items-center py-6 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                      Payment Successful!
                    </h3>

                    {/* Transaction details */}
                    <div className="mt-4 w-full space-y-2 rounded-lg bg-gray-50 p-4 text-left dark:bg-gray-900/50">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Amount</span>
                        <span className="font-medium">
                          {amount} {selectedToken}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">To</span>
                        <span className="font-mono text-xs">
                          {formatAddress(recipientAddress)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">TX Hash</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs">
                            {formatAddress(txHash)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(txHash)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {copiedText === txHash ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-1 h-3.5 w-3.5" />
                        View on Explorer
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleReset}>
                        Send Another
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <QrCode className="mb-3 h-16 w-16 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500">
                      Enter recipient address and amount
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Fill the form to send a payment
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent quick payments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Quick Payments</CardTitle>
              <CardDescription>
                Your last 5 manual payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500">No recent payments</p>
                <p className="mt-1 text-xs text-gray-400">
                  Your quick payment history will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}