'use client'

import { useState } from 'react'
import {
  addProjectMember,
  removeProjectMember,
  updateProjectMemberRole,
} from '@/actions/project'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { UserPlus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProjectMember {
  id: string
  role: 'ADMIN' | 'EDITOR' | 'VIEWER'
  user: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
  }
}

interface TenantMember {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface ProjectMemberManagerProps {
  projectId: string
  members: ProjectMember[]
  tenantMembers: TenantMember[]
}

const roleLabels = {
  ADMIN: '管理者',
  EDITOR: '編集者',
  VIEWER: '閲覧者',
}

const roleBadgeVariants = {
  ADMIN: 'default' as const,
  EDITOR: 'secondary' as const,
  VIEWER: 'outline' as const,
}

export default function ProjectMemberManager({
  projectId,
  members,
  tenantMembers,
}: ProjectMemberManagerProps) {
  const router = useRouter()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'EDITOR' | 'VIEWER'>('VIEWER')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // プロジェクトにまだ参加していないテナントメンバーのリスト
  const availableMembers = tenantMembers.filter(
    (tm) => !members.some((pm) => pm.user.id === tm.user.id)
  )

  const handleAddMember = async () => {
    if (!selectedUserId) {
      setError('ユーザーを選択してください')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      await addProjectMember(projectId, selectedUserId, selectedRole)
      setAddDialogOpen(false)
      setSelectedUserId('')
      setSelectedRole('VIEWER')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'メンバーの追加に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await removeProjectMember(projectId, userId)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'メンバーの削除に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateRole = async (userId: string, role: 'ADMIN' | 'EDITOR' | 'VIEWER') => {
    setIsLoading(true)
    setError(null)
    try {
      await updateProjectMemberRole(projectId, userId, role)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ロールの変更に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>メンバー</CardTitle>
            <CardDescription>プロジェクトメンバーの管理</CardDescription>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                メンバー追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>メンバーを追加</DialogTitle>
                <DialogDescription>
                  テナントメンバーをプロジェクトに招待します。
                </DialogDescription>
              </DialogHeader>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="user">ユーザー</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="ユーザーを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMembers.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          追加可能なメンバーがいません
                        </div>
                      ) : (
                        availableMembers.map((member) => (
                          <SelectItem key={member.user.id} value={member.user.id}>
                            {member.user.name} ({member.user.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">ロール</Label>
                  <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">管理者</SelectItem>
                      <SelectItem value="EDITOR">編集者</SelectItem>
                      <SelectItem value="VIEWER">閲覧者</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddDialogOpen(false)}
                  disabled={isLoading}
                >
                  キャンセル
                </Button>
                <Button onClick={handleAddMember} disabled={isLoading || !selectedUserId}>
                  {isLoading ? '追加中...' : '追加'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {error && !addDialogOpen && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{member.user.name}</p>
                  <p className="text-sm text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={member.role}
                  onValueChange={(value) =>
                    handleUpdateRole(member.user.id, value as any)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">管理者</SelectItem>
                    <SelectItem value="EDITOR">編集者</SelectItem>
                    <SelectItem value="VIEWER">閲覧者</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(member.user.id)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              メンバーがいません
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
