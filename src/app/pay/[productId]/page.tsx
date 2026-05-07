'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import {
  Copy,
  Check,
  Clock,
  Shield,
  Wallet,
  CreditCard,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

// Product type from URL params
interface ProductData {
  id: string
  name: string
  description: string
  price: string
  currency: string
  supportedTokens: string[]
  merchantAddress: string
  merchantName: string
}

// Mock product data
const mockProducts: Record<string, ProductData> = {
  prod_abc123: {
    id: 'prod_abc123',
    name: 'Premium NFT Collection',
    description: 'Exclusive NFT collection with 10 unique artworks by top digital artists.',
    price: '150.00',
    currency: 'USDC',
    supportedTokens: ['USDC', 'USDT', 'ETH'],
    merchantAddress: '0x7890123456789012345678901234567890123456',
    merchantName: 'NFT Gallery',
  },
  prod_def456: {
    id: 'prod_def456',
    name: 'DeFi Course Access',
    description: 'Full access to DeFi masterclass video course with 40+ hours of content.',
    price: '0.05',
    currency: 'ETH',
    supportedTokens: ['ETH', 'USDC'],
    merchantAddress: '0x0123456789012345678901234567890123456789',
    merchantName: 'Crypto Academy',
  },
}

type PaymentStep = 'idle' | 'confirming' | 'success' | 'error'

export default function PaymentPage() {
  const params = useParams()
  const productId = params.productId as string
  const { isConnected, address } = useAccount()

  // Product data
  const product = mockProducts[productId]

  // State — init amount directly from product.price
  const [selectedToken, setSelectedToken] = useState(product?.supportedTokens[0] || 'USDC')
  const [amount] = useState(product?.price || '0')
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('idle')
  const [countdown, setCountdown] = useState(900)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, setIsPending] = useState(false)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  // Format address
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(null), 2000)
  }

  // Format countdown
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate crypto amount (mock rate)
  const getCryptoPrice = () => {
    const rates: Record<string, number> = {
      USDC: 1,
      USDT: 1,
      ETH: 0.00042,
    }
    return (parseFloat(amount || '0') * (rates[selectedToken] || 1)).toFixed(6)
  }

  // Handle payment
  const handlePayment = () => {
    setIsPending(true)
    setPaymentStep('confirming')

    // Mock payment processing
    setTimeout(() => {
      setIsPending(false)
      setPaymentStep('success')
    }, 3000)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Product not found
  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="py-12">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Product Not Found
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              The product you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
      <div className="w-full max-w-lg space-y-6">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Link>

        {/* Product card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <CardDescription className="mt-1">
                  {product.description}
                </CardDescription>
              </div>
              <Badge variant="outline" className="ml-2 shrink-0">
                <Shield className="mr-1 h-3 w-3" />
                Secure
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Merchant info */}
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Merchant</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{product.merchantName}</span>
                  <button
                    onClick={() => copyToClipboard(product.merchantAddress)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {copiedText === product.merchantAddress ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Amount display */}
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Amount to pay</p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="text-4xl font-bold">
                  {parseFloat(amount || '0').toFixed(2)}
                </span>
                <span className="text-2xl text-gray-500">{product.currency}</span>
              </div>
              {selectedToken !== product.currency && (
                <p className="mt-1 text-sm text-purple-600 dark:text-purple-400">
                  ≈ {getCryptoPrice()} {selectedToken}
                </p>
              )}
            </div>

            {/* Token selector */}
            <div>
              <Label className="mb-2 block text-sm">Pay with</Label>
              <div className="grid grid-cols-3 gap-2">
                {product.supportedTokens.map((token) => (
                  <button
                    key={token}
                    onClick={() => setSelectedToken(token)}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                      selectedToken === token
                        ? 'border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-400 dark:bg-purple-900/20 dark:text-purple-400'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    {token === 'ETH' ? '🔷' : token === 'USDC' ? '💲' : '💵'}
                    {token}
                  </button>
                ))}
              </div>
            </div>

            {/* Countdown */}
            <div className="flex items-center justify-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
              <span>Rate expires in {formatCountdown(countdown)}</span>
            </div>

            {/* Payment section */}
            {!isConnected ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-gray-300 p-6 dark:border-gray-700">
                <Wallet className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Connect your wallet to proceed with payment
                </p>
                <ConnectButton />
              </div>
            ) : paymentStep === 'success' ? (
              <div className="rounded-lg bg-green-50 p-6 text-center dark:bg-green-900/20">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                  Payment Successful!
                </h3>
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                  Transaction confirmed on blockchain
                </p>
                <Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay {amount} {product.currency}
                  </>
                )}
              </Button>
            )}

            {/* Connected wallet info */}
            {isConnected && (
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Connected wallet</span>
                  <span className="font-mono text-xs font-medium">
                    {formatAddress(address!)}
                  </span>
                </div>
              </div>
            )}

            {/* Security notice */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Shield className="h-3 w-3" />
              <span>Payments are processed securely on the blockchain</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}