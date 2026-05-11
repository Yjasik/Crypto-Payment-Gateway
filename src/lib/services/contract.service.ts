
import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { parseEther, parseUnits, formatEther, formatUnits, type Address, type Hash } from 'viem'
import { config } from '@/lib/config/wagmi'
import { CONTRACT_ADDRESSES, GAS_LIMITS, PLATFORM_FEE_BPS } from '@/lib/constants/contracts'
import { TOKEN_ADDRESSES } from '@/lib/constants/contracts'

// Payment Gateway ABI — update after Foundry compilation
const paymentGatewayAbi = [
  {
    type: 'function',
    name: 'processPayment',
    inputs: [
      { name: 'merchantId', type: 'string', internalType: 'string' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'tokenAddress', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'withdrawFunds',
    inputs: [
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'tokenAddress', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getMerchantBalance',
    inputs: [{ name: 'merchantAddress', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTransactionDetails',
    inputs: [{ name: 'txId', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [
      { name: 'merchantId', type: 'string', internalType: 'string' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'token', type: 'address', internalType: 'address' },
      { name: 'payer', type: 'address', internalType: 'address' },
      { name: 'status', type: 'uint8', internalType: 'uint8' },
      { name: 'timestamp', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'registerMerchant',
    inputs: [
      { name: 'merchantId', type: 'string', internalType: 'string' },
      { name: 'payoutAddress', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'PaymentReceived',
    inputs: [
      { name: 'txId', type: 'bytes32', indexed: true },
      { name: 'merchantId', type: 'string', indexed: true },
      { name: 'payer', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'token', type: 'address', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'WithdrawalProcessed',
    inputs: [
      { name: 'merchantId', type: 'string', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'token', type: 'address', indexed: false },
    ],
  },
] as const

// ERC20 ABI minimal — for token approvals
const erc20Abi = [
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

// Transaction result type
export interface TransactionResult {
  hash: Hash
  receipt?: Awaited<ReturnType<typeof waitForTransactionReceipt>>
  txId?: string
}

// Payment details type
export interface PaymentDetails {
  merchantId: string
  amount: bigint
  token: Address
  payer: Address
  status: number
  timestamp: bigint
}

// Contract service class
export class ContractService {
  private chainId: number

  constructor(chainId: number) {
    this.chainId = chainId
  }

  // Get contract address for current chain
  private getContractAddress(): Address {
    const address = CONTRACT_ADDRESSES[this.chainId]
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      throw new Error(`Contract not deployed on chain ${this.chainId}`)
    }
    return address
  }

  // Get token address for current chain
  private getTokenAddress(token: string): Address {
    const tokenMap = TOKEN_ADDRESSES[this.chainId]
    if (!tokenMap || !tokenMap[token]) {
      throw new Error(`Token ${token} not supported on chain ${this.chainId}`)
    }
    return tokenMap[token] as Address
  }

  // Approve token spending for contract
  async approveToken(
    tokenSymbol: string,
    amount: bigint,
    ownerAddress: Address
  ): Promise<TransactionResult> {
    const tokenAddress = this.getTokenAddress(tokenSymbol)
    const contractAddress = this.getContractAddress()

    // Skip approval for native ETH
    if (tokenSymbol === 'ETH') {
      throw new Error('ETH does not require approval')
    }

    // Check current allowance
    const allowance = await readContract(config, {
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [ownerAddress, contractAddress],
    })

    if (allowance && allowance >= amount) {
      console.log('Allowance sufficient, skipping approval')
      return { hash: '0x0' as Hash } // Already approved
    }

    // Send approval transaction
    const hash = await writeContract(config, {
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [contractAddress, amount],
      gas: BigInt(GAS_LIMITS.APPROVE),
    })

    // Wait for confirmation
    const receipt = await waitForTransactionReceipt(config, { hash })

    return { hash, receipt }
  }

  // Process payment for a product
  async processPayment(
    merchantId: string,
    amount: string,
    tokenSymbol: string,
    decimals: number = 18
  ): Promise<TransactionResult> {
    const contractAddress = this.getContractAddress()
    const tokenAddress = this.getTokenAddress(tokenSymbol)

    // Parse amount to blockchain units
    const parsedAmount = tokenSymbol === 'ETH' 
      ? parseEther(amount)
      : parseUnits(amount, decimals)

    if (tokenSymbol === 'ETH') {
      // Native ETH payment
      const hash = await writeContract(config, {
        address: contractAddress,
        abi: paymentGatewayAbi,
        functionName: 'processPayment',
        args: [merchantId, parsedAmount, tokenAddress],
        value: parsedAmount,
        gas: BigInt(GAS_LIMITS.PAYMENT),
      })

      const receipt = await waitForTransactionReceipt(config, { hash })
      return { hash, receipt }
    }

    // ERC20 payment
    const hash = await writeContract(config, {
      address: contractAddress,
      abi: paymentGatewayAbi,
      functionName: 'processPayment',
      args: [merchantId, parsedAmount, tokenAddress],
      gas: BigInt(GAS_LIMITS.PAYMENT),
    })

    const receipt = await waitForTransactionReceipt(config, { hash })
    return { hash, receipt }
  }

  // Withdraw funds as merchant
  async withdrawFunds(
    amount: string,
    tokenSymbol: string,
    decimals: number = 18
  ): Promise<TransactionResult> {
    const contractAddress = this.getContractAddress()
    const tokenAddress = this.getTokenAddress(tokenSymbol)

    const parsedAmount = tokenSymbol === 'ETH'
      ? parseEther(amount)
      : parseUnits(amount, decimals)

    const hash = await writeContract(config, {
      address: contractAddress,
      abi: paymentGatewayAbi,
      functionName: 'withdrawFunds',
      args: [parsedAmount, tokenAddress],
      gas: BigInt(GAS_LIMITS.WITHDRAWAL),
    })

    const receipt = await waitForTransactionReceipt(config, { hash })
    return { hash, receipt }
  }

  // Get merchant balance
  async getMerchantBalance(merchantAddress: Address): Promise<bigint> {
    const contractAddress = this.getContractAddress()

    const balance = await readContract(config, {
      address: contractAddress,
      abi: paymentGatewayAbi,
      functionName: 'getMerchantBalance',
      args: [merchantAddress],
    })

    return balance as bigint
  }

  // Get transaction details by ID
  async getTransactionDetails(txId: string): Promise<PaymentDetails> {
    const contractAddress = this.getContractAddress()

    const details = await readContract(config, {
      address: contractAddress,
      abi: paymentGatewayAbi,
      functionName: 'getTransactionDetails',
      args: [txId as Hash],
    })

    const result = details as [string, bigint, Address, Address, number, bigint]

    return {
      merchantId: result[0],
      amount: result[1],
      token: result[2],
      payer: result[3],
      status: result[4],
      timestamp: result[5],
    }
  }

  // Register new merchant
  async registerMerchant(
    merchantId: string,
    payoutAddress: Address
  ): Promise<TransactionResult> {
    const contractAddress = this.getContractAddress()

    const hash = await writeContract(config, {
      address: contractAddress,
      abi: paymentGatewayAbi,
      functionName: 'registerMerchant',
      args: [merchantId, payoutAddress],
      gas: BigInt(GAS_LIMITS.DEFAULT),
    })

    const receipt = await waitForTransactionReceipt(config, { hash })
    return { hash, receipt }
  }

  // Calculate platform fee
  calculateFee(amount: bigint): bigint {
    return (amount * BigInt(PLATFORM_FEE_BPS)) / BigInt(10000)
  }

  // Calculate merchant amount after fee
  calculateMerchantAmount(amount: bigint): bigint {
    const fee = this.calculateFee(amount)
    return amount - fee
  }
}

// Get token decimals
export async function getTokenDecimals(tokenAddress: Address): Promise<number> {
  try {
    const decimals = await readContract(config, {
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'decimals',
    })
    return decimals as number
  } catch {
    return 18 // Default to 18 decimals
  }
}

// Get token balance
export async function getTokenBalance(
  tokenAddress: Address,
  ownerAddress: Address
): Promise<bigint> {
  try {
    const balance = await readContract(config, {
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [ownerAddress],
    })
    return balance as bigint
  } catch {
    return BigInt(0)
  }
}

// Export ABIs for direct use
export { paymentGatewayAbi, erc20Abi }