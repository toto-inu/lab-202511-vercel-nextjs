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
 * 未設定の場合はユーザーの最初のテナントを返します。
 */
export async function getCurrentTenantId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user?.id) {
    return null
  }

  // Better Authが管理するactiveOrganizationIdを優先
  const activeOrgId = (session as any)?.session?.activeOrganizationId
  if (activeOrgId) {
    return activeOrgId
  }

  // 未設定の場合は、ユーザーの最初のテナントを返す（フォールバック）
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
 * Note: Better AuthのsetActiveOrganization APIを使用します。
 */
export async function setCurrentTenantId(tenantId: string) {
  await auth.api.setActiveOrganization({
    headers: await headers(),
    body: {
      organizationId: tenantId
    }
  })

  return { success: true }
}

/**
 * ユーザーが所属する全テナントを取得
 */
export async function getUserTenants() {
  const organizations = await auth.api.listOrganizations({
    headers: await headers()
  })

  // プラン情報が必要な場合は追加で取得
  const tenantsWithPlans = await Promise.all(
    (organizations as any[]).map(async (org) => {
      const tenant = await prisma.tenant.findUnique({
        where: { id: org.id },
        include: { plan: true }
      })

      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        role: org.role,
        plan: tenant?.plan
      }
    })
  )

  return tenantsWithPlans
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
 *
 * Note: Better AuthのgetFullOrganizationを使用
 */
export async function getTenantRole(userId: string, tenantId: string): Promise<string | null> {
  try {
    const org = await auth.api.getFullOrganization({
      headers: await headers(),
      query: {
        organizationId: tenantId
      }
    }) as any

    // 現在のユーザーのロールを返す
    const member = org?.members?.find((m: any) => m.userId === userId)
    return member?.role || null
  } catch (error) {
    // エラー時は従来のDBクエリにフォールバック
    const membership = await prisma.tenantMember.findUnique({
      where: {
        userId_tenantId: { userId, tenantId }
      }
    })

    return membership?.role || null
  }
}
