import { getCurrentTenant } from '@/lib/auth/tenant-context'
import { getTenantMembers } from '@/actions/tenant'
import { requireAuth } from '@/lib/auth/permission'
import TenantMemberManager from '@/components/TenantMemberManager'
import { prisma } from '@/lib/prisma'

// 動的レンダリングを強制してキャッシュを無効化
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TenantMembersPage() {
  const user = await requireAuth()
  const tenant = await getCurrentTenant()
  const members = await getTenantMembers(tenant.id)

  // 現在のユーザーのロールを取得
  const currentMembership = await prisma.tenantMember.findUnique({
    where: {
      userId_tenantId: { userId: user.id, tenantId: tenant.id }
    }
  })

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">メンバー管理</h1>
        <p className="text-muted-foreground">
          {tenant.name}のメンバーを管理します
        </p>
      </div>

      <TenantMemberManager
        tenantId={tenant.id}
        members={members}
        currentUserId={user.id}
        currentUserRole={currentMembership?.role || null}
      />
    </div>
  )
}
