// src/components/dashboard/stats-cards.tsx — Reusable statistics card component
// Used in dashboard and analytics pages

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  description?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p
            className={cn(
              'mt-1 text-xs',
              trend === 'up' && 'text-green-600 dark:text-green-400',
              trend === 'down' && 'text-red-600 dark:text-red-400',
              (!trend || trend === 'neutral') && 'text-gray-500 dark:text-gray-400'
            )}
          >
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}