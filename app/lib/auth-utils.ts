import { auth } from './auth'
import { prisma } from './prisma'
import type { Role } from '@prisma/client'

export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('認証が必要です')
  }
  return user
}

export async function requireRole(requiredRole: Role) {
  const user = await requireAuth()
  if (user.role !== requiredRole && user.role !== 'ADMIN') {
    throw new Error('権限がありません')
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    throw new Error('管理者権限が必要です')
  }
  return user
}

export async function canAccessTodo(todoId: string) {
  const user = await requireAuth()

  // Admin は全 Todo を閲覧可能
  if (user.role === 'ADMIN') {
    return { user, canEdit: false, canView: true }
  }

  // User は自分が作成した Todo のみ操作可能
  const todo = await prisma.todo.findUnique({
    where: { id: todoId },
    select: { createdById: true },
  })

  if (!todo) {
    throw new Error('Todo が見つかりません')
  }

  const isOwner = todo.createdById === user.id

  return { user, canEdit: isOwner, canView: isOwner || user.role === 'ADMIN' }
}

export async function canEditTodo(todoId: string) {
  const { canEdit } = await canAccessTodo(todoId)
  if (!canEdit) {
    throw new Error('この Todo を編集する権限がありません')
  }
  return true
}
