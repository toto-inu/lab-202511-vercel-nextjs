'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireTenantRole, requireProjectRole, canCreateProject } from '@/lib/auth/permission'
import { checkResourceLimit, getLimitErrorMessage } from '@/lib/plan-utils'

/**
 * Tenant内の全プロジェクトを取得
 */
export async function getProjects(tenantId: string) {
  await requireTenantRole(tenantId, ['OWNER', 'ADMIN', 'MEMBER'])

  return await prisma.project.findMany({
    where: { tenantId, archived: false },
    include: {
      _count: {
        select: { todos: true, members: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * プロジェクト詳細を取得
 */
export async function getProject(projectId: string) {
  const { project } = await requireProjectRole(projectId, ['ADMIN', 'EDITOR', 'VIEWER'])

  const projectWithDetails = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tenant: { include: { plan: true } },
      _count: {
        select: { todos: true, members: true }
      }
    }
  })

  return projectWithDetails
}

/**
 * プロジェクト作成
 */
export async function createProject(tenantId: string, formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const slug = formData.get('slug') as string

  if (!name || !slug) {
    throw new Error('名前とスラッグは必須です')
  }

  // 権限チェック
  const { user, role } = await requireTenantRole(tenantId, ['OWNER', 'ADMIN'])

  if (!canCreateProject(role)) {
    throw new Error('プロジェクトを作成する権限がありません')
  }

  // プラン制限チェック
  const limitCheck = await checkResourceLimit(tenantId, 'projects')

  if (!limitCheck.allowed) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true }
    })

    throw new Error(
      getLimitErrorMessage('projects', limitCheck.limit, tenant?.plan.name || '')
    )
  }

  // スラッグの重複チェック
  const existingProject = await prisma.project.findUnique({
    where: {
      tenantId_slug: { tenantId, slug }
    }
  })

  if (existingProject) {
    throw new Error('このスラッグは既に使用されています')
  }

  // プロジェクト作成
  const project = await prisma.project.create({
    data: {
      name,
      description: description || null,
      slug,
      tenantId
    }
  })

  // 作成者をプロジェクトADMINとして追加
  await prisma.projectMember.create({
    data: {
      userId: user.id,
      projectId: project.id,
      role: 'ADMIN'
    }
  })

  revalidatePath('/projects')

  return project
}

/**
 * プロジェクト更新
 */
export async function updateProject(projectId: string, formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string | null

  if (!name) {
    throw new Error('名前は必須です')
  }

  // 権限チェック（ADMIN のみ）
  await requireProjectRole(projectId, ['ADMIN'])

  await prisma.project.update({
    where: { id: projectId },
    data: {
      name,
      description: description || null
    }
  })

  revalidatePath('/projects')
  revalidatePath(`/projects/${projectId}`)
}

/**
 * プロジェクト削除（アーカイブ）
 */
export async function deleteProject(projectId: string) {
  // 権限チェック（プロジェクト削除はTenant OWNERまたはADMINのみ）
  const { project } = await requireProjectRole(projectId, ['ADMIN'])

  await requireTenantRole(project.tenantId, ['OWNER', 'ADMIN'])

  // アーカイブ（論理削除）
  await prisma.project.update({
    where: { id: projectId },
    data: { archived: true }
  })

  revalidatePath('/projects')
}

/**
 * プロジェクトメンバーを取得
 */
export async function getProjectMembers(projectId: string) {
  await requireProjectRole(projectId, ['ADMIN', 'EDITOR', 'VIEWER'])

  return await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true
        }
      }
    },
    orderBy: { joinedAt: 'asc' }
  })
}

/**
 * プロジェクトメンバーを追加
 */
export async function addProjectMember(
  projectId: string,
  userId: string,
  role: 'ADMIN' | 'EDITOR' | 'VIEWER'
) {
  // 権限チェック
  await requireProjectRole(projectId, ['ADMIN'])

  // 既にメンバーかチェック
  const existingMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId }
    }
  })

  if (existingMember) {
    throw new Error('このユーザーは既にプロジェクトメンバーです')
  }

  await prisma.projectMember.create({
    data: {
      userId,
      projectId,
      role
    }
  })

  revalidatePath(`/projects/${projectId}`)
}

/**
 * プロジェクトメンバーのロールを変更
 */
export async function updateProjectMemberRole(
  projectId: string,
  userId: string,
  role: 'ADMIN' | 'EDITOR' | 'VIEWER'
) {
  await requireProjectRole(projectId, ['ADMIN'])

  await prisma.projectMember.update({
    where: {
      userId_projectId: { userId, projectId }
    },
    data: { role }
  })

  revalidatePath(`/projects/${projectId}`)
}

/**
 * プロジェクトメンバーを削除
 */
export async function removeProjectMember(projectId: string, userId: string) {
  await requireProjectRole(projectId, ['ADMIN'])

  await prisma.projectMember.delete({
    where: {
      userId_projectId: { userId, projectId }
    }
  })

  revalidatePath(`/projects/${projectId}`)
}
