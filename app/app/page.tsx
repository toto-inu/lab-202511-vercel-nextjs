import { getTodos } from '@/actions/todo'
import { getAssignees } from '@/actions/assignee'
import TodoTable from '@/components/TodoTable'

// 動的レンダリングを強制してキャッシュを無効化
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const todos = await getTodos()
  const assignees = await getAssignees()

  const completedCount = todos.filter(t => t.completed).length
  const totalCount = todos.length

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Todo一覧</h1>
        <p className="text-muted-foreground">
          {completedCount} / {totalCount} 件完了
        </p>
      </div>

      <TodoTable todos={todos} assignees={assignees} />
    </div>
  )
}
