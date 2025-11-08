'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getAssignees() {
  return await prisma.assignee.findMany({
    include: {
      _count: {
        select: { todos: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getAssigneeById(id: string) {
  return await prisma.assignee.findUnique({
    where: { id },
    include: {
      todos: true,
    },
  })
}

export async function createAssignee(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  await prisma.assignee.create({
    data: {
      name,
      email,
    },
  })

  revalidatePath('/assignees')
  revalidatePath('/') // Todo一覧にも影響するため
}

export async function updateAssignee(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  await prisma.assignee.update({
    where: { id },
    data: {
      name,
      email,
    },
  })

  revalidatePath('/assignees')
  revalidatePath('/') // Todo一覧にも影響するため
}

export async function deleteAssignee(id: string) {
  await prisma.assignee.delete({
    where: { id },
  })

  revalidatePath('/assignees')
  revalidatePath('/') // Todo一覧にも影響するため
}
