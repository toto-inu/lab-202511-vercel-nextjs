import { redirect } from 'next/navigation'
import { getCurrentTenant } from '@/lib/auth/session'
import { getProjects } from '@/actions/project'

// 動的レンダリングを強制してキャッシュを無効化
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  try {
    const tenant = await getCurrentTenant()
    const projects = await getProjects(tenant.id)

    // プロジェクトが存在する場合は最初のプロジェクトへリダイレクト
    if (projects.length > 0) {
      redirect(`/projects/${projects[0].id}`)
    }

    // プロジェクトがない場合はプロジェクト一覧へ
    redirect('/projects')
  } catch (error) {
    // 認証エラーの場合はログインページへリダイレクト
    redirect('/sign-in')
  }
}
