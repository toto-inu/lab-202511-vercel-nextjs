/**
 * プラン制限の使用状況を表示するバッジコンポーネント
 */

interface PlanLimitBadgeProps {
  current: number
  max: number | null
  type: 'projects' | 'users' | 'todos'
}

export default function PlanLimitBadge({ current, max, type }: PlanLimitBadgeProps) {
  const isUnlimited = max === null || max === -1
  const percentage = isUnlimited ? 0 : max === 0 ? (current > 0 ? 100 : 0) : (current / max) * 100
  const isNearLimit = percentage >= 80 && percentage < 100
  const isAtLimit = !isUnlimited && (max === 0 ? current > 0 : current >= max)

  const labels = {
    projects: 'プロジェクト',
    users: 'ユーザー',
    todos: 'Todo'
  }

  const label = labels[type]

  // 色の決定
  let colorClass = 'bg-blue-100 text-blue-800'
  if (isAtLimit) {
    colorClass = 'bg-red-100 text-red-800'
  } else if (isNearLimit) {
    colorClass = 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
      <span>
        {label}: {current} / {isUnlimited ? '無制限' : max}
      </span>
      {!isUnlimited && (
        <div className="w-16 h-2 bg-white/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-current transition-all"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
