import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from './prisma'
import { Role } from '@prisma/client'

/**
 * 現在のユーザー情報を取得（Clerk と DB を同期）
 */
export async function getCurrentUser() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  // DB のユーザーを取得または作成
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    // Clerk からユーザー情報を取得
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)

    const userEmail = clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress

    if (!userEmail) {
      throw new Error('User email not found in Clerk session')
    }

    // 新規ユーザーを作成
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: userEmail,
        name: clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
          : clerkUser.firstName || clerkUser.lastName || userEmail,
        role: 'USER',
      },
    })
  }

  return user
}

/**
 * 認証が必要な Server Action で使用
 * 未認証の場合はエラーをスロー
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized: Please sign in')
  }

  return user
}

/**
 * 管理者権限が必要な Server Action で使用
 */
export async function requireAdmin() {
  const user = await requireAuth()

  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }

  return user
}

/**
 * Todo の編集権限をチェック
 * - 管理者は全ての Todo を編集可能
 * - 通常ユーザーは自分の Todo のみ編集可能
 */
export async function canEditTodo(todoId: string) {
  const user = await requireAuth()

  // 管理者は全て編集可能
  if (user.role === 'ADMIN') {
    return true
  }

  // 通常ユーザーは自分の Todo のみ編集可能
  const todo = await prisma.todo.findUnique({
    where: { id: todoId },
    select: { createdById: true },
  })

  if (!todo) {
    return false
  }

  return todo.createdById === user.id
}

/**
 * ユーザーが管理者かどうかをチェック
 */
export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN'
}
