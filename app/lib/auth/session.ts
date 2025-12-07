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

/**
 * 現在のテナントIDを取得（Better Auth activeOrganizationから）
 *
 * Note: Better Authのorganization pluginを使用。
 * セッションのactiveOrganizationIdを返します。
 */
export async function getCurrentTenantId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // Better Authのactive organizationを返す
  // TODO: organization pluginが提供するactiveOrganizationIdを使用
  // 現在は暫定的にユーザーの最初のテナントを返す
  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      tenantMemberships: {
        take: 1,
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  return user?.tenantMemberships[0]?.tenantId || null
}

/**
 * テナント切り替え（Better Auth organization切り替え）
 *
 * Note: Better AuthのsetActiveOrganization APIを使用すべきですが、
 * 現在は暫定的に実装。将来的にはクライアント側で
 * authClient.organization.setActive()を使用します。
 */
export async function setCurrentTenantId(tenantId: string) {
  // TODO: Better Authのorganization切り替えAPIを使用
  // 現在は何もしない（クライアント側で処理）
  return { success: true }
}

/**
 * ユーザーが所属する全テナントを取得
 */
export async function getUserTenants() {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  return user.tenantMemberships.map(membership => ({
    id: membership.tenant.id,
    name: membership.tenant.name,
    slug: membership.tenant.slug,
    role: membership.role,
    plan: membership.tenant.plan
  }))
}

/**
 * 現在のテナント情報を取得
 */
export async function getCurrentTenant() {
  const tenantId = await getCurrentTenantId()

  if (!tenantId) {
    throw new Error('現在のテナントが見つかりません')
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      plan: true
    }
  })

  if (!tenant) {
    throw new Error('テナントが見つかりません')
  }

  return tenant
}

/**
 * ユーザーのテナントロールを取得
 */
export async function getTenantRole(userId: string, tenantId: string): Promise<string | null> {
  const membership = await prisma.tenantMember.findUnique({
    where: {
      userId_tenantId: { userId, tenantId }
    }
  })

  return membership?.role || null
}
