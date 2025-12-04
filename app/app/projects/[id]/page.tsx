import { getProject, getProjectMembers } from '@/actions/project'
import { getTodos } from '@/actions/todo'
import { getAllAssignees } from '@/actions/assignee'
import { getTenantMembers } from '@/actions/tenant'
import TodoTable from '@/components/TodoTable'
import ProjectEditDialog from '@/components/ProjectEditDialog'
import ProjectMemberManager from '@/components/ProjectMemberManager'

// 動的レンダリングを強制してキャッシュを無効化
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params
  const project = await getProject(id)

  if (!project) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-6xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold">プロジェクトが見つかりません</h1>
        </div>
      </div>
    )
  }

  const [todos, assignees, projectMembers, tenantMembers] = await Promise.all([
    getTodos(id),
    getAllAssignees(),
    getProjectMembers(id),
    getTenantMembers(project.tenantId)
  ])

  const completedCount = todos.filter(t => t.completed).length
  const totalCount = todos.length

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground mb-2">{project.description}</p>
            )}
            <p className="text-muted-foreground">
              {completedCount} / {totalCount} 件完了
            </p>
          </div>
          <ProjectEditDialog project={project} />
        </div>
      </div>

      <div className="grid gap-8">
        <TodoTable todos={todos} assignees={assignees} projectId={id} />
        <ProjectMemberManager
          projectId={id}
          members={projectMembers}
          tenantMembers={tenantMembers}
        />
      </div>
    </div>
  )
}
