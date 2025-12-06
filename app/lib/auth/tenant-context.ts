/**
 * Tenantコンテキスト管理
 * Better Auth ベース
 */

import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId, getCurrentUser } from '@/lib/auth/session'

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
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // グローバル管理者の場合は、最初のテナントを返す（または管理画面用に全テナントアクセス可能）
  if (user.isGlobalAdmin) {
    const tenantId = await getCurrentTenantId()

    // Cookie指定がある場合はそのテナントを返す
    if (tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { plan: true }
      })

      if (tenant) {
        return {
          ...tenant,
          plan: {
            ...tenant.plan,
            price: tenant.plan.price ? Number(tenant.plan.price) : null
          }
        }
      }
    }

    // デフォルトでは最初のテナントを返す
    const firstTenant = await prisma.tenant.findFirst({
      include: { plan: true },
      orderBy: { createdAt: 'asc' }
    })

    if (firstTenant) {
      return {
        ...firstTenant,
        plan: {
          ...firstTenant.plan,
          price: firstTenant.plan.price ? Number(firstTenant.plan.price) : null
        }
      }
    }

    throw new Error('No tenants exist in the system')
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
    return {
      ...membership.tenant,
      plan: {
        ...membership.tenant.plan,
        price: membership.tenant.plan.price ? Number(membership.tenant.plan.price) : null
      }
    }
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

  return {
    ...membership.tenant,
    plan: {
      ...membership.tenant.plan,
      price: membership.tenant.plan.price ? Number(membership.tenant.plan.price) : null
    }
  }
}

/**
 * ユーザーが所属する全Tenantを取得
 * グローバル管理者の場合は全テナントを返す
 */
export async function getUserTenants() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // グローバル管理者は全テナントにアクセス可能
  if (user.isGlobalAdmin) {
    const allTenants = await prisma.tenant.findMany({
      include: { plan: true },
      orderBy: { createdAt: 'asc' }
    })

    return allTenants.map(tenant => ({
      ...tenant,
      plan: {
        ...tenant.plan,
        price: tenant.plan.price ? Number(tenant.plan.price) : null
      },
      role: 'OWNER' as const // グローバル管理者は全権限を持つ
    }))
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
    plan: {
      ...m.tenant.plan,
      price: m.tenant.plan.price ? Number(m.tenant.plan.price) : null
    },
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
