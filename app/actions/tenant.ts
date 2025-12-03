'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { setCurrentTenantId, getUserTenants } from '@/lib/auth/tenant-context'
import { requireAuth, requireTenantRole } from '@/lib/auth/permission'
import { checkResourceLimit, getLimitErrorMessage } from '@/lib/plan-utils'

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

/**
 * Tenantにメンバーを招待
 */
export async function inviteTenantMember(
  tenantId: string,
  email: string,
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
) {
  // 権限チェック（OWNER/ADMINのみ招待可能）
  await requireTenantRole(tenantId, ['OWNER', 'ADMIN'])

  // プラン制限チェック
  const limitCheck = await checkResourceLimit(tenantId, 'users')

  if (!limitCheck.allowed) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true }
    })

    throw new Error(
      getLimitErrorMessage('users', limitCheck.limit, tenant?.plan.name || '')
    )
  }

  // ユーザーが存在するかチェック
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new Error('指定されたメールアドレスのユーザーが見つかりません')
  }

  // 既にメンバーかチェック
  const existingMember = await prisma.tenantMember.findUnique({
    where: {
      userId_tenantId: { userId: user.id, tenantId }
    }
  })

  if (existingMember) {
    throw new Error('このユーザーは既にTenantメンバーです')
  }

  // メンバー追加
  await prisma.tenantMember.create({
    data: {
      userId: user.id,
      tenantId,
      role
    }
  })

  revalidatePath(`/tenants/${tenantId}/members`)
}

/**
 * Tenantメンバーのロールを変更
 */
export async function updateTenantMemberRole(
  tenantId: string,
  userId: string,
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
) {
  // 権限チェック（OWNERのみロール変更可能）
  await requireTenantRole(tenantId, ['OWNER'])

  await prisma.tenantMember.update({
    where: {
      userId_tenantId: { userId, tenantId }
    },
    data: { role }
  })

  revalidatePath(`/tenants/${tenantId}/members`)
}

/**
 * Tenantメンバーを削除
 */
export async function removeTenantMember(tenantId: string, userId: string) {
  // 権限チェック（OWNER/ADMINのみメンバー削除可能）
  await requireTenantRole(tenantId, ['OWNER', 'ADMIN'])

  // 自分自身は削除できない
  const currentUser = await requireAuth()
  if (currentUser.id === userId) {
    throw new Error('自分自身をTenantから削除することはできません')
  }

  await prisma.tenantMember.delete({
    where: {
      userId_tenantId: { userId, tenantId }
    }
  })

  revalidatePath(`/tenants/${tenantId}/members`)
}
