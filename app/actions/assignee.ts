'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth/permission'
import { getCurrentTenant } from '@/lib/auth/tenant-context'

/**
 * 担当者一覧を取得
 * Note: Assigneeはグローバルだが、現在のTenantのTodoで使用されているもののみ表示
 */
export async function getAssignees() {
  await requireAuth()
  const tenant = await getCurrentTenant()

  // 現在のTenantで使用されているAssigneeのみ取得
  const assignees = await prisma.assignee.findMany({
    include: {
      _count: {
        select: {
          todos: {
            where: {
              tenantId: tenant.id
            }
          }
        }
      },
      todos: {
        where: {
          tenantId: tenant.id
        },
        select: {
          id: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Tenantで使用されているAssigneeのみフィルタ
  return assignees.filter(assignee => assignee.todos.length > 0)
}

/**
 * 全Assignee取得（Todo作成時の選択肢用）
 */
export async function getAllAssignees() {
  await requireAuth()
  const tenant = await getCurrentTenant()

  return await prisma.assignee.findMany({
    include: {
      _count: {
        select: {
          todos: {
            where: {
              tenantId: tenant.id
            }
          }
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
}

/**
 * Assignee詳細を取得
 */
export async function getAssigneeById(id: string) {
  await requireAuth()
  const tenant = await getCurrentTenant()

  const assignee = await prisma.assignee.findUnique({
    where: { id },
    include: {
      todos: {
        where: {
          tenantId: tenant.id
        },
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  })

  return assignee
}

/**
 * Assignee作成
 */
export async function createAssignee(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  if (!name || !email) {
    throw new Error('名前とメールアドレスは必須です')
  }

  await requireAuth()

  await prisma.assignee.create({
    data: {
      name,
      email
    }
  })

  revalidatePath('/assignees')
}

/**
 * Assignee更新
 */
export async function updateAssignee(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  if (!name || !email) {
    throw new Error('名前とメールアドレスは必須です')
  }

  await requireAuth()

  await prisma.assignee.update({
    where: { id },
    data: {
      name,
      email
    }
  })

  revalidatePath('/assignees')
}

/**
 * Assignee削除
 */
export async function deleteAssignee(id: string) {
  await requireAuth()

  // Note: AssigneeとTodoの関係はSET NULLなので、Assigneeを削除してもTodoは残る
  await prisma.assignee.delete({
    where: { id }
  })

  revalidatePath('/assignees')
}
