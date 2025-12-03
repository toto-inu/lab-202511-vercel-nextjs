'use server'

/**
 * 擬似認証用のServer Actions
 */

import { getAllDevUsers } from '@/lib/dev-auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

const DEV_USER_COOKIE = 'dev-user-id'
const TENANT_COOKIE_NAME = 'current-tenant-id'

/**
 * 全ユーザーを取得（ログイン画面用）
 */
export async function getDevUsers() {
  return await getAllDevUsers()
}

/**
 * ログイン（CookieにユーザーIDを保存）
 */
export async function devLogin(formData: FormData) {
  const userId = formData.get('userId') as string

  if (!userId) {
    throw new Error('User ID is required')
  }

  // ユーザーのデフォルトTenantを取得
  const membership = await prisma.tenantMember.findFirst({
    where: { userId },
    orderBy: { joinedAt: 'asc' }
  })

  const cookieStore = await cookies()
  cookieStore.set(DEV_USER_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30 // 30日
  })

  // デフォルトTenantもCookieに設定
  if (membership) {
    cookieStore.set(TENANT_COOKIE_NAME, membership.tenantId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30日
    })
  }

  redirect('/')
}

/**
 * ログアウト（Cookieを削除）
 */
export async function devLogout() {
  const cookieStore = await cookies()
  cookieStore.delete(DEV_USER_COOKIE)
  cookieStore.delete('current-tenant-id')
  redirect('/dev-login')
}

/**
 * Cookieをクリア（ログイン画面用）
 */
export async function clearDevCookies() {
  const cookieStore = await cookies()
  cookieStore.delete(DEV_USER_COOKIE)
  cookieStore.delete('current-tenant-id')
}
