import { getCurrentTenant } from '@/lib/auth/session'
import { requireTenantRole } from '@/lib/auth/permission'
import ProjectForm from '@/components/ProjectForm'
import { redirect } from 'next/navigation'

// 動的レンダリングを強制してキャッシュを無効化
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NewProjectPage() {
  try {
    const tenant = await getCurrentTenant()

    // 権限チェック（OWNER/ADMINのみプロジェクト作成可能）
    await requireTenantRole(tenant.id, ['OWNER', 'ADMIN'])

    return (
      <div className="container mx-auto py-10 px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">新規プロジェクト作成</h1>
          <p className="text-muted-foreground">
            {tenant.name} にプロジェクトを作成します
          </p>
        </div>

        <ProjectForm tenantId={tenant.id} />
      </div>
    )
  } catch (error) {
    if (error instanceof Error) {
      // 権限エラー
      if (error.message.includes('Insufficient tenant permissions')) {
        return (
          <div className="container mx-auto py-10 px-4 max-w-6xl">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">アクセス権限がありません</h1>
              <p className="text-muted-foreground">
                プロジェクトを作成する権限がありません。
              </p>
            </div>
          </div>
        )
      }

      // 認証エラー
      if (error.message.includes('ログインが必要') ||
          error.message.includes('Not authenticated')) {
        redirect('/sign-in')
      }
    }
    throw error
  }
}
