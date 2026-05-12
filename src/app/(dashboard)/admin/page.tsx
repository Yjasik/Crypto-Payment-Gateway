// src/app/(dashboard)/admin/page.tsx — Admin panel page (refactored)
'use client'

import { useAccount } from 'wagmi'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatsCard } from '@/components/dashboard/stats-cards'
import { OverviewTab } from '@/components/admin/overview-tab'
import { KycTab } from '@/components/admin/kyc-tab'
import { UsersTab } from '@/components/admin/users-tab'
import {
  Shield,
  Users,
  DollarSign,
  Activity,
  FileCheck,
  BarChart3,
} from 'lucide-react'

export default function AdminPage() {
  const { isConnected } = useAccount()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Panel</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Manage platform users, KYC, and transactions
        </p>
      </div>

      {!isConnected ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold">Connect admin wallet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Connect your admin wallet to access the panel
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tabs with refactored components */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">
                <BarChart3 className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="mr-2 h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="kyc">
                <FileCheck className="mr-2 h-4 w-4" />
                KYC Management
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="mr-2 h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab — refactored component */}
            <TabsContent value="overview">
              <OverviewTab />
            </TabsContent>

            {/* Users Tab — refactored component */}
            <TabsContent value="users">
              <UsersTab />
            </TabsContent>

            {/* KYC Management Tab — refactored component */}
            <TabsContent value="kyc">
              <KycTab />
            </TabsContent>

            {/* Activity Tab — kept simple (transactions table) */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Activity className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-semibold">Activity Log</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Detailed activity tracking coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}