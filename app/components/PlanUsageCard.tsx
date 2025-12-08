/**
 * プラン使用状況を表示するカードコンポーネント
 */

import { getResourceUsage } from '@/lib/plan-utils'
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react'

interface PlanUsageCardProps {
  tenantId: string
  projectId?: string
}

export default async function PlanUsageCard({ tenantId, projectId }: PlanUsageCardProps) {
  let usage
  try {
    usage = await getResourceUsage(tenantId, projectId)
  } catch (error) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">プラン使用状況</h3>
        <p className="text-sm text-red-600">使用状況の読み込みに失敗しました。</p>
      </div>
    )
  }

  const resourceItems = [
    {
      label: 'プロジェクト数',
      current: usage?.projects?.current ?? 0,
      limit: usage?.projects?.limit ?? null,
      percentage: usage?.projects?.percentage ?? 0,
      icon: '📁'
    },
    {
      label: 'ユーザー数',
      current: usage?.users?.current ?? 0,
      limit: usage?.users?.limit ?? null,
      percentage: usage?.users?.percentage ?? 0,
      icon: '👥'
    }
  ]

  if (usage?.todos && projectId) {
    resourceItems.push({
      label: 'Todo数（このプロジェクト）',
      current: usage.todos.current ?? 0,
      limit: usage.todos.limit ?? null,
      percentage: usage.todos.percentage ?? 0,
      icon: '✓'
    })
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">プラン使用状況</h3>

      <div className="space-y-4">
        {resourceItems.map((item) => {
          const isUnlimited = item.limit === null || item.limit === -1
          const NEAR_LIMIT_THRESHOLD = 80
          const isNearLimit = !isUnlimited && item.percentage >= NEAR_LIMIT_THRESHOLD && item.percentage < 100
          const isAtLimit = !isUnlimited && item.limit !== null && item.current >= item.limit

          let statusIcon = <CheckCircle className="h-5 w-5 text-green-500" />
          let statusText = '良好'
          let statusColor = 'text-green-600'

          if (isAtLimit) {
            statusIcon = <AlertCircle className="h-5 w-5 text-red-500" />
            statusText = '上限到達'
            statusColor = 'text-red-600'
          } else if (isNearLimit) {
            statusIcon = <TrendingUp className="h-5 w-5 text-yellow-500" />
            statusText = '上限接近'
            statusColor = 'text-yellow-600'
          }

          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {statusIcon}
                  <span className={`text-sm font-medium ${statusColor}`}>
                    {statusText}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {item.current} / {isUnlimited ? '無制限' : item.limit}
                </span>
                {!isUnlimited && (
                  <span>{item.percentage}%</span>
                )}
              </div>

              {!isUnlimited && (
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isAtLimit
                        ? 'bg-red-500'
                        : isNearLimit
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(item.percentage ?? 0, 100))}%` }}
                  />
                </div>
              )}

              {isAtLimit && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">
                    <strong>上限に達しました。</strong>
                    プランをアップグレードしてください。
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
