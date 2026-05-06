'use client'

import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { config } from '@/lib/config/wagmi'
import '@rainbow-me/rainbowkit/styles.css'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 2,
            refetchOnWindowFocus: true,
          },
        },
      })
  )

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#7C3AED',           
            accentColorForeground: '#FFFFFF', 
            borderRadius: 'medium',          
            fontStack: 'system',            
            overlayBlur: 'small',             
          })}
          showRecentTransactions={true}
          locale="en"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}