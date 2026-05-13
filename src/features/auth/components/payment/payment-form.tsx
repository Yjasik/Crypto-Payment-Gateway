'use client'

import { useState, useEffect } from 'react'
import { useAccount, useChainId, useWriteContract } from 'wagmi'
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
  Clock,
  Shield,
  Wallet,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
} from 'lucide-react'

// Supported tokens
interface TokenOption {
  symbol: string
  name: string
  icon: string
  decimals: number
  address: string
}

const supportedTokens: TokenOption[] = [
  { symbol: 'USDC', name: 'USD Coin', icon: '💲', decimals: 6, address: '0x...' },
  { symbol: 'USDT', name: 'Tether', icon: '💵', decimals: 6, address: '0x...' },
  { symbol: 'ETH', name: 'Ethereum', icon: '🔷', decimals: 18, address: '0xEeee...' },
]

// Payment step type
type PaymentStep = 'idle' | 'connecting' | 'approving' | 'paying' | 'confirming' | 'success' | 'error'

// Component props
interface PaymentFormProps {
  productId: string
  productName: string
  amount: string
  currency: string
  merchantAddress: string
  onSuccess?: (txHash: string) => void
  onError?: (error: string) => void
}

export function PaymentForm({
  productId,
  productName,
  amount: defaultAmount,
  currency: defaultCurrency,
  merchantAddress,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  const { writeContractAsync, isPending } = useWriteContract()

  // State
  const [selectedToken, setSelectedToken] = useState<string | null>(
    defaultCurrency || 'USDC'
  )
  const [amount, setAmount] = useState(defaultAmount)
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(900) // 15 min
  const [copiedText, setCopiedText] = useState<string | null>(null)

  // Find selected token data
  const selectedTokenData = supportedTokens.find(
    (t) => t.symbol === selectedToken
  )

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0 || paymentStep !== 'idle') return
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown, paymentStep])

  // Format countdown
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format address
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(null), 2000)
  }

  // Calculate crypto amount (mock exchange rate)
  const getCryptoAmount = () => {
    const rates: Record<string, number> = {
      USDC: 1,
      USDT: 1,
      ETH: 0.00042,
    }
    const rate = rates[selectedToken || 'USDC'] || 1
    return (parseFloat(amount || '0') * rate).toFixed(6)
  }

  // Handle payment
  const handlePayment = async () => {
    if (!isConnected || !address) {
      setPaymentStep('connecting')
      return
    }

    try {
      setPaymentStep('paying')
      setErrorMessage(null)

      // Mock transaction hash
      const hash = '0x' + Math.random().toString(16).slice(2, 42)

      // Simulate blockchain confirmation
      await new Promise((resolve) => setTimeout(resolve, 3000))

      setTxHash(hash)
      setPaymentStep('success')
      onSuccess?.(hash)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed'
      setErrorMessage(message)
      setPaymentStep('error')
      onError?.(message)
    }
  }

  // Reset payment
  const handleReset = () => {
    setPaymentStep('idle')
    setTxHash(null)
    setErrorMessage(null)
    setCountdown(900)
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Product info */}
      <div className="text-center">
        <h2 className="text-xl font-bold">{productName}</h2>
        <p className="mt-1 text-gray-500">Product ID: {productId}</p>
      </div>

      {/* Amount display */}
      <div className="rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-900/50">
        <p className="text-sm text-gray-500">Amount to pay</p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-4xl font-bold">
            ${parseFloat(amount || '0').toFixed(2)}
          </span>
          <span className="text-2xl text-gray-400">{defaultCurrency}</span>
        </div>
        {selectedToken !== defaultCurrency && (
          <p className="mt-1 text-sm text-purple-600 dark:text-purple-400">
            ≈ {getCryptoAmount()} {selectedToken}
          </p>
        )}
      </div>

      {/* Token selector */}
      <div className="space-y-2">
        <Label>Pay with</Label>
        <div className="grid grid-cols-3 gap-2">
          {supportedTokens.map((token) => (
            <button
              key={token.symbol}
              onClick={() => setSelectedToken(token.symbol)}
              className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${
                selectedToken === token.symbol
                  ? 'border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-400 dark:bg-purple-900/20 dark:text-purple-400'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300'
              }`}
            >
              <span>{token.icon}</span>
              {token.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Rate expiry countdown */}
      {paymentStep === 'idle' && (
        <div className="flex items-center justify-center gap-2 text-sm text-amber-600 dark:text-amber-400">
          <Clock className="h-4 w-4" />
          <span>Rate expires in {formatCountdown(countdown)}</span>
        </div>
      )}

      {/* Payment button / status */}
      {paymentStep === 'success' ? (
        /* Success state */
        <div className="rounded-lg bg-green-50 p-6 text-center dark:bg-green-900/20">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
            <Check className="h-7 w-7 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
            Payment Successful!
          </h3>
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
            Transaction confirmed on blockchain
          </p>

          {/* Transaction details */}
          {txHash && (
            <div className="mt-4 space-y-2 rounded-lg bg-white p-4 text-left dark:bg-gray-950">
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
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium">
                  ${amount} {defaultCurrency}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Paid in</span>
                <span className="font-medium">
                  {getCryptoAmount()} {selectedToken}
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-3 justify-center">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-1 h-3.5 w-3.5" />
              View on Explorer
            </Button>
            <Button size="sm" onClick={handleReset}>
              Pay Again
            </Button>
          </div>
        </div>
      ) : paymentStep === 'error' ? (
        /* Error state */
        <div className="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-800">
            <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
            Payment Failed
          </h3>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errorMessage || 'Something went wrong'}
          </p>
          <Button className="mt-4" variant="outline" onClick={handleReset}>
            Try Again
          </Button>
        </div>
      ) : !isConnected ? (
        /* Connect wallet prompt */
        <Button className="w-full" size="lg" onClick={() => setPaymentStep('connecting')}>
          <Wallet className="mr-2 h-5 w-5" />
          Connect Wallet to Pay
        </Button>
      ) : (
        /* Pay button */
        <Button
          className="w-full"
          size="lg"
          onClick={handlePayment}
          disabled={isPending || paymentStep === 'paying'}
        >
          {isPending || paymentStep === 'paying' ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              Pay ${amount} {defaultCurrency}
            </>
          )}
        </Button>
      )}

      {/* Connected wallet info */}
      {isConnected && address && paymentStep !== 'success' && (
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Connected wallet</span>
            <span className="font-mono text-xs font-medium">
              {formatAddress(address)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-500">Network</span>
            <span className="font-medium">Chain ID: {chainId}</span>
          </div>
        </div>
      )}

      {/* Security notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <Shield className="h-3 w-3" />
        <span>Payments are processed securely on the blockchain</span>
      </div>
    </div>
  )
}