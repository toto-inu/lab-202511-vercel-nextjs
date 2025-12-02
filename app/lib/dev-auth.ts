/**
 * 擬似認証ヘルパー
 * 開発・テスト用の簡易認証機能
 * LocalStorageでユーザーIDを管理
 */

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

const DEV_USER_KEY = 'dev-user-id'
const DEV_USER_COOKIE = 'dev-user-id'

/**
 * LocalStorageから現在のユーザーIDを取得（クライアント側のみ）
 */
export function getDevUserIdFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(DEV_USER_KEY)
}

/**
 * LocalStorageにユーザーIDを保存（クライアント側のみ）
 */
export function setDevUserIdToStorage(userId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(DEV_USER_KEY, userId)
}

/**
 * LocalStorageからユーザーIDを削除（クライアント側のみ）
 */
export function clearDevUserFromStorage(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DEV_USER_KEY)
}

/**
 * 現在のユーザーを取得（サーバー側）
 * LocalStorageではなく、引数でuserIdを受け取る
 */
export async function getDevUser(userId: string | null) {
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
 * 全ユーザーを取得（ログイン画面用）
 */
export async function getAllDevUsers() {
  const users = await prisma.user.findMany({
    include: {
      tenantMemberships: {
        include: {
          tenant: true
        }
      }
    },
    orderBy: {
      email: 'asc'
    }
  })

  return users
}

/**
 * 現在のユーザーIDを取得（Cookie から）
 * Server Componentから呼び出し可能
 */
export async function getCurrentDevUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(DEV_USER_COOKIE)?.value || null
}
