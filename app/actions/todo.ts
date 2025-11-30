'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth, isAdmin, canEditTodo } from '@/lib/auth-utils'

export async function getTodos() {
  const user = await requireAuth()
  const userIsAdmin = await isAdmin()

  // 管理者は全ての Todo を表示、通常ユーザーは自分の Todo のみ
  return await prisma.todo.findMany({
    where: userIsAdmin ? {} : { createdById: user.id },
    include: {
      assignee: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getTodoById(id: string) {
  const user = await requireAuth()
  const userIsAdmin = await isAdmin()

  const todo = await prisma.todo.findUnique({
    where: { id },
    include: {
      assignee: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  // 管理者以外は自分の Todo のみ取得可能
  if (!userIsAdmin && todo?.createdById !== user.id) {
    throw new Error('Forbidden: You can only access your own todos')
  }

  return todo
}

export async function createTodo(formData: FormData) {
  const user = await requireAuth()

  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const assigneeId = formData.get('assigneeId') as string | null

  await prisma.todo.create({
    data: {
      title,
      description: description || null,
      assigneeId: assigneeId || null,
      createdById: user.id,
    },
  })

  revalidatePath('/')
}

export async function updateTodo(id: string, formData: FormData) {
  // 編集権限をチェック
  const hasPermission = await canEditTodo(id)
  if (!hasPermission) {
    throw new Error('Forbidden: You can only edit your own todos')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const completed = formData.get('completed') === 'true'
  const assigneeId = formData.get('assigneeId') as string | null

  await prisma.todo.update({
    where: { id },
    data: {
      title,
      description: description || null,
      completed,
      assigneeId: assigneeId || null,
    },
  })

  revalidatePath('/')
}

export async function toggleTodo(id: string, completed: boolean) {
  // 編集権限をチェック
  const hasPermission = await canEditTodo(id)
  if (!hasPermission) {
    throw new Error('Forbidden: You can only edit your own todos')
  }

  await prisma.todo.update({
    where: { id },
    data: { completed },
  })

  revalidatePath('/')
}

export async function deleteTodo(id: string) {
  // 編集権限をチェック
  const hasPermission = await canEditTodo(id)
  if (!hasPermission) {
    throw new Error('Forbidden: You can only delete your own todos')
  }

  await prisma.todo.delete({
    where: { id },
  })

  revalidatePath('/')
}
