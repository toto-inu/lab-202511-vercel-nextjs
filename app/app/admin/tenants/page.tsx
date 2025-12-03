import { getAllTenantsWithStats } from '@/actions/admin'
import TenantListTable from '@/components/admin/TenantListTable'

// 動的レンダリングを強制してキャッシュを無効化
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminTenantsPage() {
  const tenants = await getAllTenantsWithStats()

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">テナント管理</h1>
        <p className="text-muted-foreground">
          全テナントのプラン使用状況を管理
        </p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">全テナント一覧</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {tenants.length} 件のテナント
          </p>
        </div>

        <TenantListTable tenants={tenants} />
      </div>
    </div>
  )
}
