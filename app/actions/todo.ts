'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth, canEditTodo, getCurrentUser } from '@/lib/auth-utils'

export async function getTodos() {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  // Admin は全 Todo を閲覧可能
  if (user.role === 'ADMIN') {
    return await prisma.todo.findMany({
      include: {
        assignee: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  // User は自分が作成した Todo のみ
  return await prisma.todo.findMany({
    where: {
      createdById: user.id,
    },
    include: {
      assignee: true,
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getTodoById(id: string) {
  const user = await requireAuth()

  const todo = await prisma.todo.findUnique({
    where: { id },
    include: {
      assignee: true,
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  if (!todo) {
    return null
  }

  // Admin は全 Todo にアクセス可能
  if (user.role === 'ADMIN') {
    return todo
  }

  // User は自分の Todo のみ
  if (todo.createdById !== user.id) {
    throw new Error('この Todo にアクセスする権限がありません')
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
  await canEditTodo(id)

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
  await canEditTodo(id)

  await prisma.todo.update({
    where: { id },
    data: { completed },
  })

  revalidatePath('/')
}

export async function deleteTodo(id: string) {
  await canEditTodo(id)

  await prisma.todo.delete({
    where: { id },
  })

  revalidatePath('/')
}
