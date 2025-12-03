'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth, requireProjectRole, canEditTodo } from '@/lib/auth/permission'
import { checkResourceLimit, getLimitErrorMessage } from '@/lib/plan-utils'
import { TodoPriority } from '@prisma/client'

/**
 * プロジェクト内のTodo一覧を取得
 */
export async function getTodos(projectId: string) {
  await requireProjectRole(projectId, ['ADMIN', 'EDITOR', 'VIEWER'])

  return await prisma.todo.findMany({
    where: { projectId },
    include: {
      assignee: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

/**
 * Todo詳細を取得
 */
export async function getTodoById(id: string) {
  const user = await requireAuth()

  const todo = await prisma.todo.findUnique({
    where: { id },
    include: {
      assignee: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      project: true
    }
  })

  if (!todo) {
    throw new Error('Todo not found')
  }

  // アクセス権チェック
  await requireProjectRole(todo.projectId, ['ADMIN', 'EDITOR', 'VIEWER'])

  return todo
}

/**
 * Todo作成
 */
export async function createTodo(projectId: string, formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const assigneeId = formData.get('assigneeId') as string | null
  const priorityStr = formData.get('priority') as string | null

  if (!title) {
    throw new Error('タイトルは必須です')
  }

  // 権限チェック
  const { user, project } = await requireProjectRole(projectId, ['ADMIN', 'EDITOR'])

  // プラン制限チェック
  const limitCheck = await checkResourceLimit(project.tenantId, 'todos', projectId)

  if (!limitCheck.allowed) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: project.tenantId },
      include: { plan: true }
    })

    throw new Error(
      getLimitErrorMessage('todos', limitCheck.limit, tenant?.plan.name || '')
    )
  }

  const priority = (priorityStr as TodoPriority) || 'MEDIUM'

  await prisma.todo.create({
    data: {
      title,
      description: description || null,
      assigneeId: assigneeId || null,
      priority,
      tenantId: project.tenantId,
      projectId,
      createdById: user.id
    }
  })

  revalidatePath(`/projects/${projectId}`)
}

/**
 * Todo更新
 */
export async function updateTodo(id: string, formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const completed = formData.get('completed') === 'true'
  const assigneeId = formData.get('assigneeId') as string | null
  const priorityStr = formData.get('priority') as string | null

  if (!title) {
    throw new Error('タイトルは必須です')
  }

  const user = await requireAuth()

  // 編集権限チェック
  const hasPermission = await canEditTodo(user.id, id)

  if (!hasPermission) {
    throw new Error('このTodoを編集する権限がありません')
  }

  const todo = await prisma.todo.findUnique({
    where: { id }
  })

  if (!todo) {
    throw new Error('Todo not found')
  }

  const priority = priorityStr ? (priorityStr as TodoPriority) : undefined

  await prisma.todo.update({
    where: { id },
    data: {
      title,
      description: description || null,
      completed,
      assigneeId: assigneeId || null,
      ...(priority && { priority })
    }
  })

  revalidatePath(`/projects/${todo.projectId}`)
}

/**
 * Todo完了状態の切り替え
 */
export async function toggleTodo(id: string, completed: boolean) {
  const user = await requireAuth()

  const hasPermission = await canEditTodo(user.id, id)

  if (!hasPermission) {
    throw new Error('このTodoを編集する権限がありません')
  }

  const todo = await prisma.todo.findUnique({
    where: { id }
  })

  if (!todo) {
    throw new Error('Todo not found')
  }

  await prisma.todo.update({
    where: { id },
    data: { completed }
  })

  revalidatePath(`/projects/${todo.projectId}`)
}

/**
 * Todo削除
 */
export async function deleteTodo(id: string) {
  const user = await requireAuth()

  const hasPermission = await canEditTodo(user.id, id)

  if (!hasPermission) {
    throw new Error('このTodoを削除する権限がありません')
  }

  const todo = await prisma.todo.findUnique({
    where: { id }
  })

  if (!todo) {
    throw new Error('Todo not found')
  }

  await prisma.todo.delete({
    where: { id }
  })

  revalidatePath(`/projects/${todo.projectId}`)
}
