import { getAssignees } from '@/actions/assignee'
import AssigneeTable from '@/components/AssigneeTable'

// 動的レンダリングを強制してキャッシュを無効化
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AssigneesPage() {
  const assignees = await getAssignees()

  const totalTodos = assignees.reduce((sum, a) => sum + a._count.todos, 0)

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">担当者一覧</h1>
        <p className="text-muted-foreground">
          {assignees.length} 人の担当者が {totalTodos} 件のTodoを管理中
        </p>
      </div>

      <AssigneeTable assignees={assignees} />
    </div>
  )
}
