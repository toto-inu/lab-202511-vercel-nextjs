/**
 * 権限チェックヘルパー
 * Better Auth ベース
 */

import { TenantRole, ProjectRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

/**
 * 認証チェック（ログイン必須）
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  return user
}

/**
 * 特定TenantRoleを要求
 */
export async function requireTenantRole(
  tenantId: string,
  allowedRoles: TenantRole[]
) {
  const user = await requireAuth()

  // グローバル管理者は全権限
  if (user.isGlobalAdmin) {
    return { user, role: 'OWNER' as TenantRole }
  }

  const membership = await prisma.tenantMember.findUnique({
    where: {
      userId_tenantId: { userId: user.id, tenantId }
    }
  })

  if (!membership || !allowedRoles.includes(membership.role)) {
    throw new Error('Insufficient tenant permissions')
  }

  return { user, role: membership.role }
}

/**
 * ProjectRoleを要求
 */
export async function requireProjectRole(
  projectId: string,
  allowedRoles: ProjectRole[]
) {
  const user = await requireAuth()

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  })

  if (!project) {
    throw new Error('Project not found')
  }

  // グローバル管理者は全権限
  if (user.isGlobalAdmin) {
    return { user, role: 'ADMIN' as ProjectRole, project }
  }

  // Tenant OWNER/ADMINは自動的にプロジェクトADMIN
  const tenantMembership = await prisma.tenantMember.findUnique({
    where: {
      userId_tenantId: { userId: user.id, tenantId: project.tenantId }
    }
  })

  if (tenantMembership?.role === 'OWNER' || tenantMembership?.role === 'ADMIN') {
    return { user, role: 'ADMIN' as ProjectRole, project }
  }

  // 明示的なProjectMembershipをチェック
  const projectMembership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId: user.id, projectId }
    }
  })

  if (!projectMembership || !allowedRoles.includes(projectMembership.role)) {
    throw new Error('Insufficient project permissions')
  }

  return { user, role: projectMembership.role, project }
}

/**
 * Todoの編集・削除権限チェック
 */
export async function canEditTodo(userId: string, todoId: string): Promise<boolean> {
  const todo = await prisma.todo.findUnique({
    where: { id: todoId },
    include: { project: true }
  })

  if (!todo) return false

  // 作成者は常に編集可能
  if (todo.createdById === userId) return true

  // Project権限をチェック
  try {
    await requireProjectRole(todo.projectId, ['ADMIN', 'EDITOR'])
    return true
  } catch {
    return false
  }
}

/**
 * グローバル管理者チェック
 */
export async function requireGlobalAdmin() {
  const user = await requireAuth()

  if (!user.isGlobalAdmin) {
    throw new Error('Global admin access required')
  }

  return user
}
