'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { setCurrentTenantId, getUserTenants } from '@/lib/auth/tenant-context'
import { requireAuth, requireTenantRole, requireGlobalAdmin } from '@/lib/auth/permission'
import { checkResourceLimit, getLimitErrorMessage } from '@/lib/plan-utils'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

/**
 * Tenant切り替え
 */
export async function switchTenant(tenantId: string) {
  const user = await requireAuth()

  // グローバル管理者は全テナントにアクセス可能
  if (!user.isGlobalAdmin) {
    // アクセス権チェック
    const membership = await prisma.tenantMember.findUnique({
      where: {
        userId_tenantId: { userId: user.id, tenantId }
      }
    })

    if (!membership) {
      throw new Error('このTenantにアクセスする権限がありません')
    }
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

  // グローバル管理者は全テナントにアクセス可能
  if (!user.isGlobalAdmin) {
    // アクセス権チェック
    const membership = await prisma.tenantMember.findUnique({
      where: {
        userId_tenantId: { userId: user.id, tenantId }
      }
    })

    if (!membership) {
      throw new Error('このTenantにアクセスする権限がありません')
    }
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

  // グローバル管理者は全テナントにアクセス可能
  if (!user.isGlobalAdmin) {
    // アクセス権チェック
    const membership = await prisma.tenantMember.findUnique({
      where: {
        userId_tenantId: { userId: user.id, tenantId }
      }
    })

    if (!membership) {
      throw new Error('このTenantにアクセスする権限がありません')
    }
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
 * Tenantにメンバーを招待（ユーザーアカウントがない場合は作成）
 */
export async function inviteTenantMember(
  tenantId: string,
  email: string,
  name: string,
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
  let user = await prisma.user.findUnique({
    where: { email }
  })

  // ユーザーが存在しない場合は作成
  if (!user) {
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash('password123', 10)

    user = await prisma.$transaction(async (tx) => {
      // ユーザーを作成
      const newUser = await tx.user.create({
        data: {
          email,
          name,
          emailVerified: false,
          isGlobalAdmin: false
        }
      })

      // Better Auth Accountを作成（パスワード保存）
      await tx.account.create({
        data: {
          id: `${newUser.id}-credential`,
          accountId: `${newUser.id}-credential`,
          providerId: 'credential',
          userId: newUser.id,
          password: hashedPassword
        }
      })

      return newUser
    })
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

/**
 * Tenantを作成（グローバル管理者のみ）
 * オーナーユーザーアカウントも同時に作成
 */
export async function createTenantWithOwner(
  tenantName: string,
  tenantSlug: string,
  ownerName: string,
  ownerEmail: string,
  planName: string = 'TRIAL'
) {
  // グローバル管理者チェック
  await requireGlobalAdmin()

  // slugの重複チェック
  const existingTenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug }
  })

  if (existingTenant) {
    throw new Error('このslugは既に使用されています')
  }

  // プランを取得
  const plan = await prisma.plan.findUnique({
    where: { name: planName }
  })

  if (!plan) {
    throw new Error(`プラン "${planName}" が見つかりません`)
  }

  // ユーザーの存在チェック
  const existingUser = await prisma.user.findUnique({
    where: { email: ownerEmail }
  })

  if (existingUser) {
    throw new Error('このメールアドレスは既に使用されています')
  }

  // パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash('password123', 10)

  // トランザクションでユーザー、Tenant、メンバーシップを作成
  const result = await prisma.$transaction(async (tx) => {
    // ユーザーを作成
    const user = await tx.user.create({
      data: {
        email: ownerEmail,
        name: ownerName,
        emailVerified: false,
        isGlobalAdmin: false
      }
    })

    // Better Auth Accountを作成（パスワード保存）
    await tx.account.create({
      data: {
        id: `${user.id}-credential`,
        accountId: `${user.id}-credential`,
        providerId: 'credential',
        userId: user.id,
        password: hashedPassword
      }
    })

    // Tenantを作成
    const tenant = await tx.tenant.create({
      data: {
        name: tenantName,
        slug: tenantSlug,
        planId: plan.id,
        status: 'TRIAL'
      }
    })

    // TenantメンバーシップをOWNERで作成
    await tx.tenantMember.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
        role: 'OWNER'
      }
    })

    return { user, tenant }
  })

  revalidatePath('/admin/tenants')

  return result
}
