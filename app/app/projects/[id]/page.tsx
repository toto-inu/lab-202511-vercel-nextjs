import { getProject } from '@/actions/project'
import { getTodos } from '@/actions/todo'
import { getAllAssignees } from '@/actions/assignee'
import TodoTable from '@/components/TodoTable'
import PlanUsageCard from '@/components/PlanUsageCard'

// 動的レンダリングを強制してキャッシュを無効化
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params
  const [project, todos, assignees] = await Promise.all([
    getProject(id),
    getTodos(id),
    getAllAssignees()
  ])

  if (!project) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-6xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold">プロジェクトが見つかりません</h1>
        </div>
      </div>
    )
  }

  const completedCount = todos.filter(t => t.completed).length
  const totalCount = todos.length

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{project.name}</h1>
        {project.description && (
          <p className="text-muted-foreground mb-4">{project.description}</p>
        )}
        <p className="text-muted-foreground">
          {completedCount} / {totalCount} 件完了
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TodoTable todos={todos} assignees={assignees} projectId={id} />
        </div>
        <div className="lg:col-span-1">
          <PlanUsageCard tenantId={project.tenantId} projectId={id} />
        </div>
      </div>
    </div>
  )
}
