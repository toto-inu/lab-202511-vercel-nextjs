import { getAssignees } from '@/actions/assignee'
import { getCurrentTenant } from '@/lib/auth/session'
import AssigneeTable from '@/components/AssigneeTable'
import { redirect } from 'next/navigation'

// 動的レンダリングを強制してキャッシュを無効化
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AssigneesPage() {
  try {
    const tenant = await getCurrentTenant()
    const assignees = await getAssignees()

    const totalTodos = assignees.reduce((sum, a) => sum + a._count.todos, 0)

    return (
      <div className="container mx-auto py-10 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">担当者一覧</h1>
          <p className="text-muted-foreground">
            {tenant.name} で {assignees.length} 人の担当者が {totalTodos} 件のTodoを管理中
          </p>
        </div>

        <AssigneeTable assignees={assignees} />
      </div>
    )
  } catch (error) {
    // 認証エラーの場合のみログインページへリダイレクト
    if (error instanceof Error &&
        (error.message.includes('テナントが見つかりません') ||
         error.message.includes('認証が必要です'))) {
      redirect('/sign-in')
    }

    // その他のエラーはログ出力して再スロー
    console.error('Assignees page error:', error)
    throw error
  }
}
