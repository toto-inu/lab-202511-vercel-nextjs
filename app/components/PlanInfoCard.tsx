'use client'

/**
 * プラン情報を表示するカードコンポーネント
 */

import { useState } from 'react'
import PlanChangeDialog from './admin/PlanChangeDialog'
import type { Plan } from '@prisma/client'

interface Tenant {
  id: string
  name: string
  plan: Plan
}

interface PlanInfoCardProps {
  tenant: Tenant
  isGlobalAdmin: boolean
}

export default function PlanInfoCard({ tenant, isGlobalAdmin }: PlanInfoCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const formatLimit = (limit: number | null | undefined) => {
    if (limit === null || limit === undefined || limit === -1) return '無制限'
    return limit.toLocaleString()
  }

  const getPlanBadgeColor = (planName: string) => {
    if (planName === 'ENTERPRISE') return 'bg-purple-100 text-purple-800 border-purple-200'
    if (planName === 'PRO') return 'bg-blue-100 text-blue-800 border-blue-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <>
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">契約プラン</h2>
          {isGlobalAdmin && (
            <button
              onClick={() => setIsDialogOpen(true)}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              プラン変更
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* プラン名と料金 */}
          <div>
            <div className={`inline-flex items-center px-4 py-2 rounded-full border font-semibold text-lg ${getPlanBadgeColor(tenant.plan.name)}`}>
              {tenant.plan.name}
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold">¥{(tenant.plan.price ?? 0).toLocaleString()}</span>
              <span className="text-gray-600 ml-2">/月</span>
            </div>
          </div>

          {/* プラン制限 */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">プラン制限</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">プロジェクト数</div>
                <div className="text-2xl font-bold">{formatLimit(tenant.plan.maxProjects)}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">ユーザー数</div>
                <div className="text-2xl font-bold">{formatLimit(tenant.plan.maxUsersPerTenant)}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Todo数</div>
                <div className="text-2xl font-bold">{formatLimit(tenant.plan.maxTodosPerProject)}</div>
              </div>
            </div>
          </div>

          {/* テナント情報 */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">テナント情報</h3>
            <p className="text-gray-800">{tenant.name}</p>
          </div>
        </div>
      </div>

      {isGlobalAdmin && (
        <PlanChangeDialog
          tenant={{
            id: tenant.id,
            name: tenant.name,
            plan: {
              id: tenant.plan.id,
              name: tenant.plan.name
            }
          }}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </>
  )
}
