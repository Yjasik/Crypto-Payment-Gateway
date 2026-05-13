import { z } from 'zod'

// Supported currencies
export const SupportedCurrencies = ['USDC', 'USDT', 'ETH'] as const

// Product schema for creation
export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters')
    .trim(),

  price: z
    .string()
    .refine((val) => !isNaN(Number(val)), 'Price must be a valid number')
    .refine((val) => Number(val) > 0, 'Price must be greater than 0')
    .refine(
      (val) => Number(val) <= 1000000,
      'Price must be less than $1,000,000'
    ),

  currency: z.enum(SupportedCurrencies, 'Currency must be USDC, USDT, or ETH'),

  supportedTokens: z
    .array(z.enum(SupportedCurrencies, 'Invalid token'))
    .min(1, 'At least one payment token is required')
    .max(3, 'Maximum 3 tokens supported'),

  imageUrl: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),

  category: z
    .string()
    .max(50, 'Category must be less than 50 characters')
    .optional(),

  metadata: z
    .record(z.string(), z.string())
    .optional(),
})

// Product schema for updates (all fields optional)
export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().min(1, 'Product ID is required'),
  status: z.enum(['active', 'inactive'], 'Invalid status').optional(),
})

// Product ID schema
export const productIdSchema = z.object({
  productId: z
    .string()
    .min(1, 'Product ID is required')
    .regex(/^prod_[a-zA-Z0-9]+$/, 'Invalid product ID format'),
})

// Payment link schema
export const paymentLinkSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Invalid amount'),
  token: z.enum(SupportedCurrencies, 'Invalid token'),
  redirectUrl: z
    .string()
    .url('Must be a valid URL')
    .optional(),
})

// Bulk product import schema
export const bulkProductSchema = z.object({
  products: z
    .array(createProductSchema)
    .min(1, 'At least one product is required')
    .max(50, 'Maximum 50 products per bulk import'),
})

// Product search/filter schema
export const productFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive'], 'Invalid status').optional(),
  currency: z.enum(SupportedCurrencies, 'Invalid currency').optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  sortBy: z
    .enum(['name', 'price', 'createdAt', 'totalSales'], 'Invalid sort')
    .optional()
    .default('createdAt'),
  sortOrder: z
    .enum(['asc', 'desc'], 'Invalid order')
    .optional()
    .default('desc'),
  page: z
    .string()
    .optional()
    .default('1'),
  limit: z
    .string()
    .optional()
    .default('10'),
  category: z.string().optional(),
})

// Export types
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductIdInput = z.infer<typeof productIdSchema>
export type PaymentLinkInput = z.infer<typeof paymentLinkSchema>
export type BulkProductInput = z.infer<typeof bulkProductSchema>
export type ProductFilterInput = z.infer<typeof productFilterSchema>

// Validation helper functions
export function validateCreateProduct(data: unknown) {
  return createProductSchema.safeParse(data)
}

export function validateUpdateProduct(data: unknown) {
  return updateProductSchema.safeParse(data)
}

export function validateProductId(data: unknown) {
  return productIdSchema.safeParse(data)
}

export function validatePaymentLink(data: unknown) {
  return paymentLinkSchema.safeParse(data)
}

export function validateBulkProducts(data: unknown) {
  return bulkProductSchema.safeParse(data)
}

export function validateProductFilters(data: unknown) {
  return productFilterSchema.safeParse(data)
}

// Custom error messages
export const ProductValidationMessages = {
  NAME_TOO_SHORT: 'Product name must be at least 3 characters',
  NAME_TOO_LONG: 'Product name must be less than 100 characters',
  DESCRIPTION_TOO_SHORT: 'Description must be at least 10 characters',
  DESCRIPTION_TOO_LONG: 'Description must be less than 1000 characters',
  PRICE_INVALID: 'Please enter a valid price',
  PRICE_TOO_LOW: 'Price must be greater than 0',
  PRICE_TOO_HIGH: 'Price must be less than $1,000,000',
  CURRENCY_INVALID: 'Please select a valid currency (USDC, USDT, or ETH)',
  TOKENS_REQUIRED: 'At least one payment token is required',
  TOKENS_MAX: 'Maximum 3 payment tokens allowed',
} as const