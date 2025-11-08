import { getTodos } from '@/actions/todo'
import { getAssignees } from '@/actions/assignee'
import TodoTable from '@/components/TodoTable'

// 動的レンダリングを強制してキャッシュを無効化
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const todos = await getTodos()
  const assignees = await getAssignees()

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Todo一覧</h1>
      </div>

      <TodoTable todos={todos} assignees={assignees} />
    </div>
  )
}
