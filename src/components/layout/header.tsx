'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import {
  Menu,
  X,
  Bell,
  Search,
  Sun,
  Moon,
  ChevronDown,
  LayoutDashboard,
  CreditCard,
  Package,
  ArrowLeftRight,
  Settings,
  LogOut,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const pathname = usePathname()
  const { address, isConnected } = useAccount()
  const [isSearchOpen, setSearchOpen] = useState(false)
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/analytics': 'Analytics',
      '/transactions': 'Transactions',
      '/payouts': 'Payouts',
      '/products': 'Products',
      '/admin': 'Admin Panel',
      '/users': 'Users',
      '/kyc': 'KYC Management',
      '/settings': 'Settings',
      '/payments': 'Payments',
    }
    return titles[pathname || '/'] || 'Dashboard'
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-gray-800 dark:bg-gray-950/95">
      <div className="flex h-14 items-center gap-4 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        <div className="hidden md:block">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex-1" />

        <div className="hidden md:flex">
          {isSearchOpen ? (
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions, products..."
                className="w-64 rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
                autoFocus
                onBlur={() => setSearchOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchOpen(false)
                }}
              />
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500" />
          </span>
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDark ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted
            const connected = ready && account && chain

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <Button onClick={openConnectModal} size="sm">
                        Connect Wallet
                      </Button>
                    )
                  }

                  if (chain.unsupported) {
                    return (
                      <Button
                        onClick={openChainModal}
                        variant="destructive"
                        size="sm"
                      >
                        Wrong network
                      </Button>
                    )
                  }

                  return (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={openChainModal}
                        variant="outline"
                        size="sm"
                        className="hidden gap-1.5 md:flex"
                      >
                        {chain.hasIcon && chain.iconUrl && (
                          <img
                            alt={chain.name}
                            src={chain.iconUrl}
                            className="h-4 w-4"
                          />
                        )}
                        {chain.name}
                        <ChevronDown className="h-3 w-3 opacity-50" />
                      </Button>
                      <Button
                        onClick={openAccountModal}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        {account.ensAvatar && (
                          <img
                            alt="ENS Avatar"
                            src={account.ensAvatar}
                            className="h-4 w-4 rounded-full"
                          />
                        )}
                        <span className="hidden md:inline">
                          {account.displayName}
                        </span>
                        <span className="md:hidden">
                          {formatAddress(account.address)}
                        </span>
                        <span className="hidden text-xs text-gray-400 md:inline">
                          {account.displayBalance
                            ? ` (${account.displayBalance})`
                            : ''}
                        </span>
                        <ChevronDown className="h-3 w-3 opacity-50" />
                      </Button>
                    </div>
                  )
                })()}
              </div>
            )
          }}
        </ConnectButton.Custom>
        {isConnected && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">My Account</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {address ? formatAddress(address) : ''}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/products" className="flex items-center">
                  <Package className="mr-2 h-4 w-4" />
                  Products
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/transactions" className="flex items-center">
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                  Transactions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950 md:hidden">
          <nav className="flex flex-col space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/products"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Package className="h-4 w-4" />
              Products
            </Link>
            <Link
              href="/transactions"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ArrowLeftRight className="h-4 w-4" />
              Transactions
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}