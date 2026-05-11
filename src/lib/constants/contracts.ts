
import type { Address } from 'viem'
import { sepolia, polygon, mainnet } from 'wagmi/chains'

// Chain metadata type
interface ChainMetadata {
  name: string
  explorerUrl: string
  currency: string
}

// Contract addresses — update after deployment
export const CONTRACT_ADDRESSES: Record<number, Address> = {
  [mainnet.id]: '0x0000000000000000000000000000000000000000', // TODO: Deploy to mainnet
  [sepolia.id]: '0x0000000000000000000000000000000000000000', // TODO: Deploy to Sepolia
  [polygon.id]: '0x0000000000000000000000000000000000000000', // TODO: Deploy to Polygon
}

// Token addresses by chain
export const TOKEN_ADDRESSES: Record<number, Record<string, Address>> = {
  [mainnet.id]: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native ETH marker
  },
  [sepolia.id]: {
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC mock
    USDT: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06', // Sepolia USDT mock
    ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  },
  [polygon.id]: {
    USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  },
}

// Contract name for logging
export const CONTRACT_NAME = 'CryptoPaymentGateway'

// Supported chains for payment
export const SUPPORTED_CHAINS = [mainnet.id, sepolia.id, polygon.id]

// Chain metadata — FIXED: added index signature
export const CHAIN_METADATA: Record<number, ChainMetadata> = {
  [mainnet.id]: {
    name: 'Ethereum',
    explorerUrl: 'https://etherscan.io',
    currency: 'ETH',
  },
  [sepolia.id]: {
    name: 'Sepolia Testnet',
    explorerUrl: 'https://sepolia.etherscan.io',
    currency: 'ETH',
  },
  [polygon.id]: {
    name: 'Polygon',
    explorerUrl: 'https://polygonscan.com',
    currency: 'MATIC',
  },
}

// Transaction explorer URL builder
export function getExplorerTxUrl(chainId: number, txHash: string): string {
  const chain = CHAIN_METADATA[chainId]
  const baseUrl = chain ? chain.explorerUrl : 'https://etherscan.io'
  return `${baseUrl}/tx/${txHash}`
}

// Address explorer URL builder
export function getExplorerAddressUrl(chainId: number, address: Address): string {
  const chain = CHAIN_METADATA[chainId]
  const baseUrl = chain ? chain.explorerUrl : 'https://etherscan.io'
  return `${baseUrl}/address/${address}`
}

// Gas limits — FIXED: BigInt as string for ES2020 target
export const GAS_LIMITS = {
  DEFAULT: 300000,
  PAYMENT: 200000,
  WITHDRAWAL: 250000,
  APPROVE: 50000,
} as const

// Platform fee (in basis points, 50 = 0.5%)
export const PLATFORM_FEE_BPS = 50

// Minimum payment in USD
export const MINIMUM_PAYMENT_USD = 1