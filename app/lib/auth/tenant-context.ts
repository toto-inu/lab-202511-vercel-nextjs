/**
 * Tenantコンテキスト管理
 * 開発用認証（dev-auth）ベース
 */

import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getCurrentDevUserId, getDevUser } from '@/lib/dev-auth'

const TENANT_COOKIE_NAME = 'current-tenant-id'

/**
 * 現在アクティブなTenantIDを取得（Cookie）
 */
export async function getCurrentTenantId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(TENANT_COOKIE_NAME)?.value || null
}

/**
 * アクティブTenantを設定（Cookie）
 */
export async function setCurrentTenantId(tenantId: string) {
  const cookieStore = await cookies()
  cookieStore.set(TENANT_COOKIE_NAME, tenantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30 // 30日
  })
}

/**
 * 現在のTenantを取得（メンバーシップチェック付き）
 */
export async function getCurrentTenant() {
  const userId = await getCurrentDevUserId()
  if (!userId) {
    throw new Error('Not authenticated')
  }

  const user = await getDevUser(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const tenantId = await getCurrentTenantId()

  if (!tenantId) {
    // デフォルトTenantを取得（最初に参加したTenant）
    const membership = await prisma.tenantMember.findFirst({
      where: { userId: user.id },
      include: { tenant: { include: { plan: true } } },
      orderBy: { joinedAt: 'asc' }
    })

    if (!membership) {
      throw new Error('No tenant found for user')
    }

    // Server Componentから呼ばれている場合はCookie設定できないので、ただ返すだけ
    return membership.tenant
  }

  // 指定されたTenantへのアクセス権をチェック
  const membership = await prisma.tenantMember.findUnique({
    where: {
      userId_tenantId: { userId: user.id, tenantId }
    },
    include: { tenant: { include: { plan: true } } }
  })

  if (!membership) {
    throw new Error('Access denied to tenant')
  }

  return membership.tenant
}

/**
 * ユーザーが所属する全Tenantを取得
 */
export async function getUserTenants() {
  const userId = await getCurrentDevUserId()
  if (!userId) {
    throw new Error('Not authenticated')
  }

  const user = await getDevUser(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const memberships = await prisma.tenantMember.findMany({
    where: { userId: user.id },
    include: {
      tenant: {
        include: { plan: true }
      }
    },
    orderBy: { joinedAt: 'asc' }
  })

  return memberships.map(m => ({
    ...m.tenant,
    role: m.role
  }))
}

/**
 * ユーザーのTenantロールを取得
 */
export async function getTenantRole(userId: string, tenantId: string) {
  const membership = await prisma.tenantMember.findUnique({
    where: {
      userId_tenantId: { userId, tenantId }
    }
  })

  return membership?.role || null
}
