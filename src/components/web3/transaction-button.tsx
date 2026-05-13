'use client'

import { useState, useCallback } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { waitForTransactionReceipt } from '@wagmi/core'
import { config } from '@/lib/config/wagmi'
import type { Hash } from 'viem'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'

// Transaction states
type TxStatus = 'idle' | 'waiting_approval' | 'pending' | 'confirming' | 'success' | 'error'

// Transaction button props
interface TransactionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'children'> {
  /** Function that executes the transaction and returns a hash */
  onSend: () => Promise<Hash>
  /** Called when transaction is confirmed */
  onTxSuccess?: (hash: Hash) => void
  /** Called when transaction fails */
  onTxError?: (error: Error) => void
  /** Explorer URL for viewing transaction */
  explorerUrl?: string
  /** Label before transaction starts */
  defaultLabel?: string
  /** Label while waiting for wallet approval */
  approvalLabel?: string
  /** Label while transaction is pending */
  pendingLabel?: string
  /** Label while transaction is confirming */
  confirmingLabel?: string
  /** Label on success */
  successLabel?: string
  /** Label on error */
  errorLabel?: string
  /** Auto-reset to idle after success (ms) */
  resetAfter?: number
  /** Show explorer link on success */
  showExplorerLink?: boolean
  /** Button variant */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function TransactionButton({
  onSend,
  onTxSuccess,
  onTxError,
  explorerUrl,
  defaultLabel = 'Send Transaction',
  approvalLabel = 'Approve in Wallet',
  pendingLabel = 'Processing',
  confirmingLabel = 'Confirming',
  successLabel = 'Confirmed!',
  errorLabel = 'Failed',
  resetAfter = 5000,
  showExplorerLink = true,
  variant = 'default',
  size = 'default',
  className,
  ...buttonProps
}: TransactionButtonProps) {
  const [status, setStatus] = useState<TxStatus>('idle')
  const [txHash, setTxHash] = useState<Hash | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Handle transaction flow
  const handleTransaction = useCallback(async () => {
    if (status !== 'idle') return

    try {
      // Step 1: Send transaction
      setStatus('waiting_approval')
      setErrorMessage(null)

      const hash = await onSend()

      // Step 2: Wait for confirmation
      setTxHash(hash)
      setStatus('pending')

      const receipt = await waitForTransactionReceipt(config, {
        hash,
        timeout: 60_000, // 60 second timeout
      })

      // Step 3: Success
      setStatus('success')
      onTxSuccess?.(hash)

      // Auto-reset
      if (resetAfter > 0) {
        setTimeout(() => {
          setStatus('idle')
          setTxHash(null)
        }, resetAfter)
      }
    } catch (error) {
      console.error('Transaction error:', error)

      // Handle user rejection
      if (
        error instanceof Error &&
        (error.message.includes('User rejected') ||
          error.message.includes('User denied'))
      ) {
        setErrorMessage('Transaction rejected by user')
      } else {
        const message =
          error instanceof Error ? error.message : 'Transaction failed'
        setErrorMessage(message)
      }

      setStatus('error')
      onTxError?.(error instanceof Error ? error : new Error('Unknown error'))
    }
  }, [status, onSend, onTxSuccess, onTxError, resetAfter])

  // Handle reset
  const handleReset = useCallback(() => {
    setStatus('idle')
    setTxHash(null)
    setErrorMessage(null)
  }, [])

  // Render button content based on status
  const renderContent = () => {
    switch (status) {
      case 'waiting_approval':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {approvalLabel}
          </>
        )

      case 'pending':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {pendingLabel}
          </>
        )

      case 'confirming':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {confirmingLabel}
          </>
        )

      case 'success':
        return (
          <>
            <Check className="mr-2 h-4 w-4" />
            {successLabel}
          </>
        )

      case 'error':
        return (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            {errorLabel}
          </>
        )

      default:
        return <>{defaultLabel}</>
    }
  }

  return (
    <div className="space-y-2">
      {/* Error state — retry button */}
      {status === 'error' ? (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size={size}
            className={className}
            onClick={handleReset}
            {...buttonProps}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            {errorLabel} — Click to retry
          </Button>
        </div>
      ) : status === 'success' ? (
        /* Success state */
        <div className="flex gap-2">
          <Button
            variant="default"
            size={size}
            className={`bg-green-600 hover:bg-green-700 ${className}`}
            disabled
            {...buttonProps}
          >
            <Check className="mr-2 h-4 w-4" />
            {successLabel}
          </Button>
          {showExplorerLink && txHash && explorerUrl && (
            <Button
              variant="outline"
              size={size}
              onClick={() => window.open(`${explorerUrl}/tx/${txHash}`, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View
            </Button>
          )}
        </div>
      ) : (
        /* Default / loading states */
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={handleTransaction}
          disabled={status !== 'idle'}
          {...buttonProps}
        >
          {renderContent()}
        </Button>
      )}

      {/* Transaction hash display */}
      {txHash && status === 'success' && (
        <p className="text-xs text-gray-500">
          TX:{' '}
          <code className="font-mono text-purple-600 dark:text-purple-400">
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </code>
        </p>
      )}

      {/* Error message */}
      {errorMessage && status === 'error' && (
        <p className="text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  )
}

// Pre-configured buttons for common actions
export function PayButton({
  amount,
  token,
  onPay,
  ...props
}: Omit<TransactionButtonProps, 'onSend' | 'defaultLabel'> & {
  amount: string
  token: string
  onPay: () => Promise<Hash>
}) {
  return (
    <TransactionButton
      onSend={onPay}
      defaultLabel={`Pay ${amount} ${token}`}
      approvalLabel="Confirm payment in wallet"
      pendingLabel="Processing payment"
      confirmingLabel="Confirming on blockchain"
      successLabel="Payment confirmed!"
      errorLabel="Payment failed"
      {...props}
    />
  )
}

export function WithdrawButton({
  amount,
  token,
  onWithdraw,
  ...props
}: Omit<TransactionButtonProps, 'onSend' | 'defaultLabel'> & {
  amount: string
  token: string
  onWithdraw: () => Promise<Hash>
}) {
  return (
    <TransactionButton
      onSend={onWithdraw}
      defaultLabel={`Withdraw ${amount} ${token}`}
      approvalLabel="Confirm withdrawal"
      pendingLabel="Processing withdrawal"
      confirmingLabel="Confirming on blockchain"
      successLabel="Withdrawal complete!"
      errorLabel="Withdrawal failed"
      {...props}
    />
  )
}

export function ApproveButton({
  token,
  onApprove,
  ...props
}: Omit<TransactionButtonProps, 'onSend' | 'defaultLabel'> & {
  token: string
  onApprove: () => Promise<Hash>
}) {
  return (
    <TransactionButton
      onSend={onApprove}
      defaultLabel={`Approve ${token}`}
      approvalLabel="Confirm approval"
      pendingLabel="Processing approval"
      confirmingLabel="Confirming"
      successLabel={`${token} approved!`}
      errorLabel="Approval failed"
      {...props}
    />
  )
}