import { getCurrentTenant } from '@/lib/auth/tenant-context'
import { getProjects } from '@/actions/project'
import ProjectList from '@/components/ProjectList'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'

// 動的レンダリングを強制してキャッシュを無効化
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProjectsPage() {
  try {
    const tenant = await getCurrentTenant()
    const projects = await getProjects(tenant.id)

    return (
      <div className="container mx-auto py-10 px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">プロジェクト</h1>
            <p className="text-muted-foreground">
              {projects.length} 件のプロジェクト
            </p>
          </div>
          <Link href="/projects/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規プロジェクト
            </Button>
          </Link>
        </div>

        <ProjectList projects={projects} />
      </div>
    )
  } catch (error) {
    // 認証エラーの場合のみログインページへリダイレクト
    if (error instanceof Error && error.message.includes('ログインが必要')) {
      redirect('/sign-in')
    }
    // その他のエラーは再スロー
    throw error
  }
}
