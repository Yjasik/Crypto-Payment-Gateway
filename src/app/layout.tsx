import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Geist } from 'next/font/google'
import { Providers } from './providers'
import '@/styles/globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'CryptoPayment Gateway',
    template: '%s | CryptoPayment Gateway',
  },
  description: 'Accept cryptocurrency payments with ease. Secure, fast, and decentralized payment processing.',
  keywords: ['crypto', 'payments', 'blockchain', 'web3', 'cryptocurrency'],
  authors: [{ name: 'CryptoPayment Gateway' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    siteName: 'CryptoPayment Gateway',
    title: 'CryptoPayment Gateway',
    description: 'Accept cryptocurrency payments with ease',
    images: '/images/og-image.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoPayment Gateway',
    description: 'Accept cryptocurrency payments with ease',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      className={cn(inter.variable, jetbrainsMono.variable, "font-sans", geist.variable)}
    >
      <head>
        <link rel="icon" href="/images/logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/images/logo.svg" />
      </head>
      
      <body className="min-h-screen bg-white font-sans text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <Providers>
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>
        </Providers>
        <div id="rainbowkit-portal" />
      </body>
    </html>
  )
}