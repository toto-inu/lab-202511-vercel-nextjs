'use client'

import { useState, useTransition } from 'react'
import { User, Shield, Trash2 } from 'lucide-react'
import { updateUserRole, deleteUser } from '@/actions/user'
import type { Role } from '@prisma/client'

interface UserData {
  id: string
  name: string | null
  email: string
  role: Role
  image: string | null
  createdAt: Date
  _count: {
    todos: number
  }
}

interface UserListProps {
  users: UserData[]
  currentUserId: string
}

export function UserList({ users, currentUserId }: UserListProps) {
  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              ユーザー
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              メールアドレス
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              作成Todo数
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              登録日
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              isCurrentUser={user.id === currentUserId}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function UserRow({
  user,
  isCurrentUser,
}: {
  user: UserData
  isCurrentUser: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleRoleChange = (newRole: Role) => {
    startTransition(async () => {
      try {
        await updateUserRole(user.id, newRole)
      } catch (error) {
        alert(error instanceof Error ? error.message : 'エラーが発生しました')
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteUser(user.id)
        setShowDeleteConfirm(false)
      } catch (error) {
        alert(error instanceof Error ? error.message : 'エラーが発生しました')
      }
    })
  }

  return (
    <tr className={isPending ? 'opacity-50' : ''}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || ''}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <span className="font-medium">
            {user.name || '(名前なし)'}
            {isCurrentUser && (
              <span className="ml-2 text-xs text-muted-foreground">(自分)</span>
            )}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
        {user.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isCurrentUser ? (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full w-fit">
            <Shield className="h-3 w-3" />
            {user.role}
          </span>
        ) : (
          <select
            value={user.role}
            onChange={(e) => handleRoleChange(e.target.value as Role)}
            disabled={isPending}
            className="px-2 py-1 text-sm border rounded-md bg-background"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {user._count.todos}件
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
        {new Date(user.createdAt).toLocaleDateString('ja-JP')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {!isCurrentUser && (
          <>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  削除
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isPending}
                  className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="ユーザーを削除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </td>
    </tr>
  )
}
