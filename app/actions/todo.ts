'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getTodos() {
  return await prisma.todo.findMany({
    include: {
      assignee: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getTodoById(id: string) {
  return await prisma.todo.findUnique({
    where: { id },
    include: {
      assignee: true,
    },
  })
}

export async function createTodo(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const assigneeId = formData.get('assigneeId') as string | null

  await prisma.todo.create({
    data: {
      title,
      description: description || null,
      assigneeId: assigneeId || null,
    },
  })

  revalidatePath('/')
}

export async function updateTodo(id: string, formData: FormData) {
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
  await prisma.todo.update({
    where: { id },
    data: { completed },
  })

  revalidatePath('/')
}

export async function deleteTodo(id: string) {
  await prisma.todo.delete({
    where: { id },
  })

  revalidatePath('/')
}
