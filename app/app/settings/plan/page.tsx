import { getCurrentTenant } from '@/lib/auth/tenant-context'
import { getCurrentUser } from '@/lib/auth/session'
import PlanInfoCard from '@/components/PlanInfoCard'
import PlanUsageCard from '@/components/PlanUsageCard'
import { redirect } from 'next/navigation'

// 動的レンダリングを強制してキャッシュを無効化
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PlanPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/sign-in')
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
