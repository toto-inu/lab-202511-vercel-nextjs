import Link from 'next/link'
import { FolderKanban, CheckSquare, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description: string | null
    archived: boolean
    _count: {
      todos: number
      members: number
    }
  }
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{project.name}</CardTitle>
            </div>
            {project.archived && (
              <Badge variant="secondary">アーカイブ済み</Badge>
            )}
          </div>
          {project.description && (
            <CardDescription className="line-clamp-2">
              {project.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckSquare className="h-4 w-4" />
              <span>{project._count.todos} Todo</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{project._count.members} メンバー</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
