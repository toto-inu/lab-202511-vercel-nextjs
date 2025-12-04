'use client'

import { useState } from 'react'
import { updateProject, deleteProject } from '@/actions/project'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProjectEditDialogProps {
  project: {
    id: string
    name: string
    description: string | null
  }
}

export default function ProjectEditDialog({ project }: ProjectEditDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpdate = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)
    try {
      await updateProject(project.id, formData)
      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteProject(project.id)
      setDeleteDialogOpen(false)
      router.push('/projects')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      {/* 編集ダイアログ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            編集
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <form action={handleUpdate}>
            <DialogHeader>
              <DialogTitle>プロジェクトを編集</DialogTitle>
              <DialogDescription>
                プロジェクトの名前と説明を変更できます。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="name">プロジェクト名</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={project.name}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">説明</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={project.description || ''}
                  disabled={isLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '更新中...' : '更新'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 削除ダイアログ */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            削除
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>プロジェクトを削除</DialogTitle>
            <DialogDescription>
              本当にこのプロジェクトを削除しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? '削除中...' : '削除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
