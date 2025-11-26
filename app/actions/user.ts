'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth-utils'
import type { Role } from '@prisma/client'

export async function getUsers() {
  await requireAdmin()

  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      _count: {
        select: { todos: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function updateUserRole(userId: string, role: Role) {
  const admin = await requireAdmin()

  // 自分自身の権限は変更不可
  if (admin.id === userId) {
    throw new Error('自分自身の権限は変更できません')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  })

  revalidatePath('/admin/users')
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin()

  // 自分自身は削除不可
  if (admin.id === userId) {
    throw new Error('自分自身を削除することはできません')
  }

  await prisma.user.delete({
    where: { id: userId },
  })

  revalidatePath('/admin/users')
}
