import { z } from 'zod'

// Supported tokens
const SupportedTokens = ['USDC', 'USDT', 'ETH'] as const

// Payment status
const PaymentStatus = ['pending', 'completed', 'failed'] as const

// Blockchain address pattern
const addressRegex = /^0x[a-fA-F0-9]{40}$/

// Transaction hash pattern
const txHashRegex = /^0x[a-fA-F0-9]{64}$/

// Process payment schema (public payment page)
export const processPaymentSchema = z.object({
  productId: z
    .string()
    .min(1, 'Product ID is required')
    .regex(/^prod_[a-zA-Z0-9]+$/, 'Invalid product ID format'),

  merchantId: z
    .string()
    .min(1, 'Merchant ID is required'),

  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)), 'Amount must be a valid number')
    .refine((val) => Number(val) > 0, 'Amount must be greater than 0')
    .refine(
      (val) => Number(val) >= 1,
      'Minimum payment amount is $1.00'
    )
    .refine(
      (val) => Number(val) <= 100000,
      'Maximum payment amount is $100,000'
    ),

  token: z.enum(SupportedTokens, 'Token must be USDC, USDT, or ETH'),

  tokenAddress: z
    .string()
    .regex(addressRegex, 'Invalid token address')
    .optional(),

  payerAddress: z
    .string()
    .regex(addressRegex, 'Invalid payer address'),

  merchantAddress: z
    .string()
    .regex(addressRegex, 'Invalid merchant address'),
})

// Quick payment schema (send to any address)
export const quickPaymentSchema = z.object({
  recipientAddress: z
    .string()
    .regex(addressRegex, 'Invalid recipient address'),

  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)), 'Amount must be a valid number')
    .refine((val) => Number(val) > 0, 'Amount must be greater than 0'),

  token: z.enum(SupportedTokens, 'Token must be USDC, USDT, or ETH'),

  memo: z
    .string()
    .max(200, 'Memo must be less than 200 characters')
    .optional(),
})

// Payout/withdrawal schema
export const payoutSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)), 'Amount must be a valid number')
    .refine((val) => Number(val) > 0, 'Amount must be greater than 0')
    .refine(
      (val) => Number(val) >= 10,
      'Minimum withdrawal amount is $10.00'
    ),

  token: z.enum(SupportedTokens, 'Token must be USDC, USDT, or ETH'),

  payoutAddress: z
    .string()
    .regex(addressRegex, 'Invalid payout address')
    .optional(), // Uses connected wallet if not specified
})

// Token approval schema (for ApproveButton)
export const approveTokenSchema = z.object({
  token: z.enum(SupportedTokens, 'Token must be USDC, USDT, or ETH'),

  tokenAddress: z
    .string()
    .regex(addressRegex, 'Invalid token address'),

  spenderAddress: z
    .string()
    .regex(addressRegex, 'Invalid spender address'),

  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)), 'Amount must be a valid number')
    .refine((val) => Number(val) > 0, 'Amount must be greater than 0'),
})

// Transaction query schema
export const transactionQuerySchema = z.object({
  txHash: z
    .string()
    .regex(txHashRegex, 'Invalid transaction hash')
    .optional(),

  status: z.enum(PaymentStatus, 'Invalid status').optional(),

  type: z.enum(['payment', 'payout', 'refund'], 'Invalid type').optional(),

  fromDate: z
    .string()
    .datetime('Invalid date format')
    .optional(),

  toDate: z
    .string()
    .datetime('Invalid date format')
    .optional(),

  page: z
    .string()
    .optional()
    .default('1'),

  limit: z
    .string()
    .optional()
    .default('20'),

  token: z.enum(SupportedTokens, 'Invalid token').optional(),
})

// Payment receipt schema
export const paymentReceiptSchema = z.object({
  txHash: z
    .string()
    .regex(txHashRegex, 'Invalid transaction hash'),

  productId: z
    .string()
    .min(1, 'Product ID is required'),

  amount: z.string(),

  token: z.string(),

  payerAddress: z
    .string()
    .regex(addressRegex, 'Invalid payer address'),

  timestamp: z.string().datetime('Invalid timestamp'),
})

// Refund schema
export const refundSchema = z.object({
  txHash: z
    .string()
    .regex(txHashRegex, 'Invalid transaction hash'),

  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be less than 500 characters')
    .optional(),

  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)), 'Amount must be a valid number')
    .refine((val) => Number(val) > 0, 'Amount must be greater than 0')
    .optional(), // Full refund if not specified
})

// Payment link generation schema
export const generatePaymentLinkSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Invalid amount')
    .optional(), // Uses product price if not specified
  token: z.enum(SupportedTokens, 'Invalid token').optional(),
  expiresIn: z
    .string()
    .refine(
      (val) => ['15m', '30m', '1h', '6h', '24h'].includes(val),
      'Expiry must be 15m, 30m, 1h, 6h, or 24h'
    )
    .optional()
    .default('15m'),
  redirectUrl: z
    .string()
    .url('Must be a valid URL')
    .optional(),
})

// Export types
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>
export type QuickPaymentInput = z.infer<typeof quickPaymentSchema>
export type PayoutInput = z.infer<typeof payoutSchema>
export type ApproveTokenInput = z.infer<typeof approveTokenSchema>
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>
export type PaymentReceiptInput = z.infer<typeof paymentReceiptSchema>
export type RefundInput = z.infer<typeof refundSchema>
export type GeneratePaymentLinkInput = z.infer<typeof generatePaymentLinkSchema>

// Validation helper functions
export function validateProcessPayment(data: unknown) {
  return processPaymentSchema.safeParse(data)
}

export function validateQuickPayment(data: unknown) {
  return quickPaymentSchema.safeParse(data)
}

export function validatePayout(data: unknown) {
  return payoutSchema.safeParse(data)
}

export function validateApproveToken(data: unknown) {
  return approveTokenSchema.safeParse(data)
}

export function validateTransactionQuery(data: unknown) {
  return transactionQuerySchema.safeParse(data)
}

export function validatePaymentReceipt(data: unknown) {
  return paymentReceiptSchema.safeParse(data)
}

export function validateRefund(data: unknown) {
  return refundSchema.safeParse(data)
}

export function validateGeneratePaymentLink(data: unknown) {
  return generatePaymentLinkSchema.safeParse(data)
}

// Custom error messages
export const PaymentValidationMessages = {
  INVALID_ADDRESS: 'Please enter a valid Ethereum address (0x...)',
  INVALID_TX_HASH: 'Please enter a valid transaction hash',
  AMOUNT_REQUIRED: 'Please enter an amount',
  AMOUNT_TOO_LOW: 'Minimum amount is $1.00',
  AMOUNT_TOO_HIGH: 'Maximum amount is $100,000',
  MIN_WITHDRAWAL: 'Minimum withdrawal is $10.00',
  TOKEN_REQUIRED: 'Please select a token',
  PRODUCT_REQUIRED: 'Product ID is required',
  MERCHANT_REQUIRED: 'Merchant ID is required',
  INVALID_PRODUCT_ID: 'Product ID must start with "prod_"',
} as const