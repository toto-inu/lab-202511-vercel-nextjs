import { getCurrentTenant } from '@/lib/auth/tenant-context'
import { getCurrentDevUserId, getDevUser } from '@/lib/dev-auth'
import PlanInfoCard from '@/components/PlanInfoCard'
import PlanUsageCard from '@/components/PlanUsageCard'

// 動的レンダリングを強制してキャッシュを無効化
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PlanPage() {
  const userId = await getCurrentDevUserId()
  if (!userId) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-6xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold">ログインが必要です</h1>
        </div>
      </div>
    )
  }

  const user = await getDevUser(userId)
  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-6xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold">ユーザーが見つかりません</h1>
        </div>
      </div>
    )
  }

  const tenant = await getCurrentTenant()

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">プラン管理</h1>
        <p className="text-muted-foreground">
          現在のプラン情報と使用状況を確認できます
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <PlanInfoCard
            tenant={{
              id: tenant.id,
              name: tenant.name,
              plan: tenant.plan
            }}
            isGlobalAdmin={user.isGlobalAdmin}
          />
        </div>
        <div>
          <PlanUsageCard tenantId={tenant.id} />
        </div>
      </div>
    </div>
  )
}
