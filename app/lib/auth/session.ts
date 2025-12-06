/**
 * Better Auth セッション管理
 */

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

/**
 * 現在のユーザーIDを取得（Better Auth Session）
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  return session?.user?.id || null
}

/**
 * 現在のユーザーを取得（DB情報含む）
 */
export async function getCurrentUser() {
  const userId = await getCurrentUserId()

  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tenantMemberships: {
        include: {
          tenant: {
            include: {
              plan: true
            }
          }
        }
      }
    }
  })

  return user
}

/**
 * セッションを取得
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  return session
}
