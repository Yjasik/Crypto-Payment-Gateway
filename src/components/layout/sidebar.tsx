'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard,
  CreditCard,
  Package,
  ArrowLeftRight,
  ArrowUpRight,
  Users,
  Shield,
  BarChart3,
  FileCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Banknote,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const merchantLinks = [
  {
    title: 'Main',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'Payments',
    items: [
      {
        name: 'Transactions',
        href: '/transactions',
        icon: ArrowLeftRight,
      },
      {
        name: 'Payouts',
        href: '/payouts',
        icon: ArrowUpRight,
      },
      {
        name: 'Products',
        href: '/products',
        icon: Package,
      },
    ],
  },
]

const adminLinks = [
  {
    title: 'Administration',
    items: [
      {
        name: 'Admin Panel',
        href: '/admin',
        icon: Shield,
      },
      {
        name: 'Users',
        href: '/users',
        icon: Users,
      },
      {
        name: 'KYC Management',
        href: '/kyc',
        icon: FileCheck,
      },
    ],
  },
]

const bottomLinks = [
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    name: 'Payments',
    href: '/payments',
    icon: CreditCard,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const isAdmin = true // Временно; позже заменить на реальную проверку

  return (
    <aside
      className={cn(
        'relative hidden border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-950 md:flex md:flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 z-10 hidden h-6 w-6 rounded-full border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 md:flex"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      <div className="flex h-14 items-center border-b border-gray-200 px-4 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white">
            <Banknote className="h-4 w-4" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold">CryptoPay</span>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-3">
        {merchantLinks.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <h3 className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href || pathname?.startsWith(link.href + '/')
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? link.name : undefined}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span>{link.name}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {isAdmin && adminLinks.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <div className="mb-2 flex items-center gap-2 px-3">
                <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {section.title}
                </h3>
                <div className="flex h-1.5 w-1.5 items-center justify-center rounded-full bg-amber-400" 
                     title="Admin access" />
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href || pathname?.startsWith(link.href + '/')
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? link.name : undefined}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span>{link.name}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-gray-200 p-3 dark:border-gray-800">
        {bottomLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || pathname?.startsWith(link.href + '/')
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? link.name : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{link.name}</span>}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}