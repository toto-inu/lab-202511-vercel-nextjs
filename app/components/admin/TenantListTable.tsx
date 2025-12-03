'use client'

/**
 * テナント一覧テーブルコンポーネント（管理者用）
 */

import { useState } from 'react'
import PlanChangeDialog from './PlanChangeDialog'

interface TenantWithStats {
  id: string
  name: string
  createdAt: Date
  plan: {
    id: string
    name: string
  }
  _count: {
    members: number
    projects: number
  }
  usage: {
    projects: {
      current: number
      limit: number | null
      percentage: number
    }
    users: {
      current: number
      limit: number | null
      percentage: number
    }
  }
}

interface TenantListTableProps {
  tenants: TenantWithStats[]
}

export default function TenantListTable({ tenants }: TenantListTableProps) {
  const [selectedTenant, setSelectedTenant] = useState<TenantWithStats | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleChangePlan = (tenant: TenantWithStats) => {
    setSelectedTenant(tenant)
    setIsDialogOpen(true)
  }

  const getUsageColor = (percentage: number, isUnlimited: boolean) => {
    if (isUnlimited) return 'bg-gray-300'
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  const getStatusBadge = (percentage: number, isUnlimited: boolean) => {
    if (isUnlimited) {
      return <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">無制限</span>
    }
    if (percentage >= 100) {
      return <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">上限</span>
    }
    if (percentage >= 80) {
      return <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-600">警告</span>
    }
    return <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">正常</span>
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-semibold">テナント名</th>
              <th className="text-left p-3 font-semibold">プラン</th>
              <th className="text-left p-3 font-semibold">プロジェクト</th>
              <th className="text-left p-3 font-semibold">ユーザー</th>
              <th className="text-left p-3 font-semibold">作成日</th>
              <th className="text-left p-3 font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => {
              const projectsUnlimited = tenant.usage.projects.limit === null || tenant.usage.projects.limit === -1
              const usersUnlimited = tenant.usage.users.limit === null || tenant.usage.users.limit === -1

              return (
                <tr key={tenant.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{tenant.name}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      tenant.plan.name === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                      tenant.plan.name === 'Pro' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tenant.plan.name}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          {tenant.usage.projects.current} / {projectsUnlimited ? '∞' : tenant.usage.projects.limit}
                        </span>
                        {getStatusBadge(tenant.usage.projects.percentage, projectsUnlimited)}
                      </div>
                      {!projectsUnlimited && (
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${getUsageColor(tenant.usage.projects.percentage, projectsUnlimited)}`}
                            style={{ width: `${Math.min(tenant.usage.projects.percentage, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          {tenant.usage.users.current} / {usersUnlimited ? '∞' : tenant.usage.users.limit}
                        </span>
                        {getStatusBadge(tenant.usage.users.percentage, usersUnlimited)}
                      </div>
                      {!usersUnlimited && (
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${getUsageColor(tenant.usage.users.percentage, usersUnlimited)}`}
                            style={{ width: `${Math.min(tenant.usage.users.percentage, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(tenant.createdAt).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleChangePlan(tenant)}
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      プラン変更
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {tenants.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            テナントがありません
          </div>
        )}
      </div>

      {selectedTenant && (
        <PlanChangeDialog
          tenant={selectedTenant}
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false)
            setSelectedTenant(null)
          }}
        />
      )}
    </>
  )
}
