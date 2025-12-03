'use server'

/**
 * グローバル管理者専用のServer Actions
 */

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireGlobalAdmin } from '@/lib/auth/permission'
import { getResourceUsage } from '@/lib/plan-utils'

/**
 * 全テナントの統計情報付き一覧を取得
 */
export async function getAllTenantsWithStats() {
  await requireGlobalAdmin()

  const tenants = await prisma.tenant.findMany({
    include: {
      plan: true,
      _count: {
        select: {
          members: true,
          projects: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  // 各テナントのリソース使用状況を取得
  const tenantsWithStats = await Promise.all(
    tenants.map(async (tenant) => {
      const usage = await getResourceUsage(tenant.id)

      return {
        ...tenant,
        usage: {
          projects: usage.projects,
          users: usage.users
        }
      }
    })
  )

  return tenantsWithStats
}

/**
 * テナントのプランを変更
 */
export async function updateTenantPlan(tenantId: string, planId: string) {
  await requireGlobalAdmin()

  // プランの存在確認
  const plan = await prisma.plan.findUnique({
    where: { id: planId }
  })

  if (!plan) {
    throw new Error('Plan not found')
  }

  // テナントのプランを更新
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { planId }
  })

  revalidatePath('/admin/tenants')

  return { success: true }
}

/**
 * 全プラン一覧を取得
 */
export async function getAllPlans() {
  await requireGlobalAdmin()

  return await prisma.plan.findMany({
    orderBy: { price: 'asc' }
  })
}
