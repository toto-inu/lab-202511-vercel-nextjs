/**
 * プラン制限チェックユーティリティ
 */

import { Plan } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/**
 * リソース制限チェック結果
 */
interface LimitCheckResult {
  allowed: boolean
  limit: number | null
  current: number
}

/**
 * リソース種別
 */
type ResourceType = 'projects' | 'users' | 'todos'

/**
 * リソース制限チェック
 */
export async function checkResourceLimit(
  tenantId: string,
  resourceType: ResourceType,
  projectId?: string
): Promise<LimitCheckResult> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { plan: true }
  })

  if (!tenant) {
    throw new Error('Tenant not found')
  }

  const plan = tenant.plan
  let limit: number | null = null
  let current = 0

  switch (resourceType) {
    case 'projects':
      limit = plan.maxProjects
      current = await prisma.project.count({
        where: { tenantId }
      })
      break

    case 'users':
      limit = plan.maxUsersPerTenant
      current = await prisma.tenantMember.count({
        where: { tenantId }
      })
      break

    case 'todos':
      limit = plan.maxTodosPerProject
      if (!projectId) {
        throw new Error('Project ID required for todos limit check')
      }
      current = await prisma.todo.count({
        where: { projectId }
      })
      break

    default:
      throw new Error(`Unknown resource type: ${resourceType}`)
  }

  // null（無制限）の場合は常に許可
  if (limit === null) {
    return { allowed: true, limit: null, current }
  }

  return {
    allowed: current < limit,
    limit,
    current
  }
}

/**
 * プラン機能フラグチェック
 */
export function hasFeature(plan: Plan, featureName: string): boolean {
  const features = plan.features as Record<string, boolean>
  return features[featureName] === true
}

/**
 * リソース制限エラーメッセージ生成
 */
export function getLimitErrorMessage(
  resourceType: ResourceType,
  limit: number | null,
  planName: string
): string {
  if (limit === null) {
    return 'リソース制限に達しました'
  }

  const resourceNames: Record<ResourceType, string> = {
    projects: 'プロジェクト',
    users: 'ユーザー',
    todos: 'Todo'
  }

  const resourceName = resourceNames[resourceType]

  return `${resourceName}の上限（${limit}個）に達しました。${planName}プランの制限です。プランをアップグレードしてください。`
}

/**
 * Tenantのプラン情報を取得
 */
export async function getTenantPlan(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { plan: true }
  })

  if (!tenant) {
    throw new Error('Tenant not found')
  }

  return tenant.plan
}

/**
 * プラン比較（アップグレード可能か）
 */
export function canUpgradeTo(currentPlanName: string, targetPlanName: string): boolean {
  const planOrder = ['FREE', 'PRO', 'ENTERPRISE']
  const currentIndex = planOrder.indexOf(currentPlanName)
  const targetIndex = planOrder.indexOf(targetPlanName)

  return targetIndex > currentIndex
}

/**
 * リソース使用状況を取得
 */
export async function getResourceUsage(tenantId: string, projectId?: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { plan: true }
  })

  if (!tenant) {
    throw new Error('Tenant not found')
  }

  const projectCount = await prisma.project.count({
    where: { tenantId }
  })

  const userCount = await prisma.tenantMember.count({
    where: { tenantId }
  })

  let todoCount = 0
  if (projectId) {
    todoCount = await prisma.todo.count({
      where: { projectId }
    })
  }

  return {
    projects: {
      current: projectCount,
      limit: tenant.plan.maxProjects,
      percentage: tenant.plan.maxProjects
        ? Math.round((projectCount / tenant.plan.maxProjects) * 100)
        : 0
    },
    users: {
      current: userCount,
      limit: tenant.plan.maxUsersPerTenant,
      percentage: tenant.plan.maxUsersPerTenant
        ? Math.round((userCount / tenant.plan.maxUsersPerTenant) * 100)
        : 0
    },
    todos: projectId
      ? {
          current: todoCount,
          limit: tenant.plan.maxTodosPerProject,
          percentage: tenant.plan.maxTodosPerProject
            ? Math.round((todoCount / tenant.plan.maxTodosPerProject) * 100)
            : 0
        }
      : null
  }
}
