'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { setCurrentTenantId, getUserTenants } from '@/lib/auth/tenant-context'
import { requireAuth } from '@/lib/auth/permission'

/**
 * Tenant切り替え
 */
export async function switchTenant(tenantId: string) {
  const user = await requireAuth()

  // アクセス権チェック
  const membership = await prisma.tenantMember.findUnique({
    where: {
      userId_tenantId: { userId: user.id, tenantId }
    }
  })

  if (!membership) {
    throw new Error('このTenantにアクセスする権限がありません')
  }

  // Cookieに保存
  await setCurrentTenantId(tenantId)

  // 全ページを再検証
  revalidatePath('/', 'layout')

  return { success: true }
}

/**
 * ユーザーが所属する全Tenantを取得
 */
export async function getCurrentUserTenants() {
  return await getUserTenants()
}

/**
 * Tenant情報を取得
 */
export async function getTenant(tenantId: string) {
  const user = await requireAuth()

  // アクセス権チェック
  const membership = await prisma.tenantMember.findUnique({
    where: {
      userId_tenantId: { userId: user.id, tenantId }
    }
  })

  if (!membership) {
    throw new Error('このTenantにアクセスする権限がありません')
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      plan: true,
      _count: {
        select: {
          members: true,
          projects: true
        }
      }
    }
  })

  return tenant
}

/**
 * Tenantメンバー一覧を取得
 */
export async function getTenantMembers(tenantId: string) {
  const user = await requireAuth()

  // アクセス権チェック
  const membership = await prisma.tenantMember.findUnique({
    where: {
      userId_tenantId: { userId: user.id, tenantId }
    }
  })

  if (!membership) {
    throw new Error('このTenantにアクセスする権限がありません')
  }

  return await prisma.tenantMember.findMany({
    where: { tenantId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          isGlobalAdmin: true
        }
      }
    },
    orderBy: { joinedAt: 'asc' }
  })
}
