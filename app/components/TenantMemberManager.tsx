'use client'

import { useState } from 'react'
import {
  inviteTenantMember,
  removeTenantMember,
  updateTenantMemberRole,
} from '@/actions/tenant'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { UserPlus, Trash2, Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TenantMember {
  id: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  user: {
    id: string
    name: string
    email: string
    image: string | null
    isGlobalAdmin: boolean
  }
}

interface TenantMemberManagerProps {
  tenantId: string
  members: TenantMember[]
  currentUserId: string
  currentUserRole: 'OWNER' | 'ADMIN' | 'MEMBER' | null
}

const roleLabels = {
  OWNER: 'オーナー',
  ADMIN: '管理者',
  MEMBER: 'メンバー',
}

const roleBadgeVariants = {
  OWNER: 'default' as const,
  ADMIN: 'secondary' as const,
  MEMBER: 'outline' as const,
}

export default function TenantMemberManager({
  tenantId,
  members,
  currentUserId,
  currentUserRole,
}: TenantMemberManagerProps) {
  const router = useRouter()
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER'>('MEMBER')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canManageMembers = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN'
  const canChangeRoles = currentUserRole === 'OWNER'

  const handleInvite = async () => {
    if (!name || !email) {
      setError('名前とメールアドレスを入力してください')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      await inviteTenantMember(tenantId, email, name, selectedRole)
      setInviteDialogOpen(false)
      setName('')
      setEmail('')
      setSelectedRole('MEMBER')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'メンバーの招待に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('このメンバーを削除してもよろしいですか？')) {
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      await removeTenantMember(tenantId, userId)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'メンバーの削除に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateRole = async (userId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER') => {
    setIsLoading(true)
    setError(null)
    try {
      await updateTenantMemberRole(tenantId, userId, role)
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
            <CardTitle>テナントメンバー</CardTitle>
            <CardDescription>テナントメンバーの管理</CardDescription>
          </div>
          {canManageMembers && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  メンバー招待
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>メンバーを招待</DialogTitle>
                  <DialogDescription>
                    新しいユーザーアカウントを作成してテナントに追加します。
                  </DialogDescription>
                </DialogHeader>
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {error}
                  </div>
                )}
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">名前</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="山田太郎"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">ロール</Label>
                    <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {canChangeRoles && <SelectItem value="OWNER">オーナー</SelectItem>}
                        <SelectItem value="ADMIN">管理者</SelectItem>
                        <SelectItem value="MEMBER">メンバー</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setInviteDialogOpen(false)
                      setError(null)
                    }}
                    disabled={isLoading}
                  >
                    キャンセル
                  </Button>
                  <Button onClick={handleInvite} disabled={isLoading || !name || !email}>
                    {isLoading ? '作成中...' : '作成'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && !inviteDialogOpen && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        <div className="space-y-4">
          {members.map((member) => {
            const isCurrentUser = member.user.id === currentUserId
            const canRemove = canManageMembers && !isCurrentUser
            const canChangeRole = canChangeRoles && !isCurrentUser

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold relative">
                    {member.user.name.charAt(0).toUpperCase()}
                    {member.user.isGlobalAdmin && (
                      <Crown className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.user.name}</p>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs">
                          あなた
                        </Badge>
                      )}
                      {member.user.isGlobalAdmin && (
                        <Badge variant="secondary" className="text-xs">
                          グローバル管理者
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canChangeRole ? (
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
                        <SelectItem value="OWNER">オーナー</SelectItem>
                        <SelectItem value="ADMIN">管理者</SelectItem>
                        <SelectItem value="MEMBER">メンバー</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={roleBadgeVariants[member.role]}>
                      {roleLabels[member.role]}
                    </Badge>
                  )}
                  {canRemove && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.user.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
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
