import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, polygon } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

const metadata = {
  name: 'CryptoPayment Gateway',
  description: 'Accept crypto payments easily',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
  icons: ['/images/logo.svg'],
}

export const config = createConfig({
  chains: [mainnet, sepolia, polygon],
  
  transports: {
    [mainnet.id]: http(
      process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://eth.llamarpc.com'
    ),
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.gateway.tenderly.co'
    ),
    [polygon.id]: http(
      process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon.llamarpc.com'
    ),
  },
  
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    walletConnect({
      projectId,
      metadata,
      showQrModal: true,
    }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0],
    }),
  ],
  
  ssr: true,
  
  batch: {
    multicall: true,
  },
})