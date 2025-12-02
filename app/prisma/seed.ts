import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // 既存のデータを削除
  await prisma.todo.deleteMany()
  await prisma.projectMember.deleteMany()
  await prisma.project.deleteMany()
  await prisma.tenantMember.deleteMany()
  await prisma.tenant.deleteMany()
  await prisma.user.deleteMany()
  await prisma.plan.deleteMany()
  await prisma.assignee.deleteMany()
  console.log('Cleared existing data')

  // ==================
  // 1. Planデータ作成
  // ==================
  const freePlan = await prisma.plan.create({
    data: {
      name: 'FREE',
      displayName: 'Free Plan',
      description: '個人・小規模チーム向け',
      maxProjects: 3,
      maxUsersPerTenant: 5,
      maxTodosPerProject: 100,
      features: {
        advancedReporting: false,
        apiAccess: false,
        customRoles: false,
        auditLog: false,
        prioritySupport: false
      }
    }
  })

  const proPlan = await prisma.plan.create({
    data: {
      name: 'PRO',
      displayName: 'Pro Plan',
      description: '中規模チーム向け',
      maxProjects: 50,
      maxUsersPerTenant: 50,
      maxTodosPerProject: 1000,
      price: 2900,
      billingCycle: 'MONTHLY',
      features: {
        advancedReporting: true,
        apiAccess: true,
        customRoles: false,
        auditLog: false,
        prioritySupport: true
      }
    }
  })

  const enterprisePlan = await prisma.plan.create({
    data: {
      name: 'ENTERPRISE',
      displayName: 'Enterprise Plan',
      description: '大規模組織向け',
      maxProjects: null, // 無制限
      maxUsersPerTenant: null,
      maxTodosPerProject: null,
      price: null, // カスタム価格
      features: {
        advancedReporting: true,
        apiAccess: true,
        customRoles: true,
        auditLog: true,
        prioritySupport: true
      }
    }
  })

  console.log('Created 3 plans')

  // ==================
  // 2. Tenantデータ作成
  // ==================
  const tenantA = await prisma.tenant.create({
    data: {
      name: 'Tenant A',
      slug: 'tenant-a',
      description: 'テストテナントA（Freeプラン）',
      planId: freePlan.id,
      status: 'ACTIVE'
    }
  })

  const tenantB = await prisma.tenant.create({
    data: {
      name: 'Tenant B',
      slug: 'tenant-b',
      description: 'テストテナントB（Proプラン）',
      planId: proPlan.id,
      status: 'ACTIVE'
    }
  })

  console.log('Created 2 tenants')

  // ==================
  // 3. Userデータ作成（7人）
  // ==================

  // グローバル管理者
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Global Admin',
      isGlobalAdmin: true
    }
  })

  // TenantA のユーザー
  const aliceUser = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice (TenantA OWNER)'
    }
  })

  const bobUser = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob (TenantA ADMIN)'
    }
  })

  const charlieUser = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      name: 'Charlie (TenantA MEMBER)'
    }
  })

  // TenantB のユーザー
  const daveUser = await prisma.user.create({
    data: {
      email: 'dave@example.com',
      name: 'Dave (TenantB OWNER)'
    }
  })

  const eveUser = await prisma.user.create({
    data: {
      email: 'eve@example.com',
      name: 'Eve (TenantB ADMIN)'
    }
  })

  const frankUser = await prisma.user.create({
    data: {
      email: 'frank@example.com',
      name: 'Frank (TenantB MEMBER)'
    }
  })

  console.log('Created 7 users')

  // ==================
  // 4. TenantMemberデータ作成
  // ==================

  // TenantA members
  await prisma.tenantMember.create({
    data: {
      userId: aliceUser.id,
      tenantId: tenantA.id,
      role: 'OWNER',
      joinedAt: new Date()
    }
  })

  await prisma.tenantMember.create({
    data: {
      userId: bobUser.id,
      tenantId: tenantA.id,
      role: 'ADMIN',
      joinedAt: new Date()
    }
  })

  await prisma.tenantMember.create({
    data: {
      userId: charlieUser.id,
      tenantId: tenantA.id,
      role: 'MEMBER',
      joinedAt: new Date()
    }
  })

  // TenantB members
  await prisma.tenantMember.create({
    data: {
      userId: daveUser.id,
      tenantId: tenantB.id,
      role: 'OWNER',
      joinedAt: new Date()
    }
  })

  await prisma.tenantMember.create({
    data: {
      userId: eveUser.id,
      tenantId: tenantB.id,
      role: 'ADMIN',
      joinedAt: new Date()
    }
  })

  await prisma.tenantMember.create({
    data: {
      userId: frankUser.id,
      tenantId: tenantB.id,
      role: 'MEMBER',
      joinedAt: new Date()
    }
  })

  console.log('Created 6 tenant memberships')

  // ==================
  // 5. Projectデータ作成
  // ==================

  const projectA1 = await prisma.project.create({
    data: {
      name: 'Project Alpha',
      slug: 'alpha',
      description: 'TenantAのプロジェクト1',
      tenantId: tenantA.id
    }
  })

  const projectA2 = await prisma.project.create({
    data: {
      name: 'Project Beta',
      slug: 'beta',
      description: 'TenantAのプロジェクト2',
      tenantId: tenantA.id
    }
  })

  const projectB1 = await prisma.project.create({
    data: {
      name: 'Project Gamma',
      slug: 'gamma',
      description: 'TenantBのプロジェクト1',
      tenantId: tenantB.id
    }
  })

  console.log('Created 3 projects')

  // ==================
  // 6. ProjectMemberデータ作成
  // ==================

  // ProjectA1 members (全員)
  await prisma.projectMember.createMany({
    data: [
      { userId: aliceUser.id, projectId: projectA1.id, role: 'ADMIN' },
      { userId: bobUser.id, projectId: projectA1.id, role: 'EDITOR' },
      { userId: charlieUser.id, projectId: projectA1.id, role: 'VIEWER' }
    ]
  })

  // ProjectA2 members (AliceとBobのみ)
  await prisma.projectMember.createMany({
    data: [
      { userId: aliceUser.id, projectId: projectA2.id, role: 'ADMIN' },
      { userId: bobUser.id, projectId: projectA2.id, role: 'EDITOR' }
    ]
  })

  // ProjectB1 members (全員)
  await prisma.projectMember.createMany({
    data: [
      { userId: daveUser.id, projectId: projectB1.id, role: 'ADMIN' },
      { userId: eveUser.id, projectId: projectB1.id, role: 'EDITOR' },
      { userId: frankUser.id, projectId: projectB1.id, role: 'VIEWER' }
    ]
  })

  console.log('Created project memberships')

  // ==================
  // 7. 担当者を作成（既存のAssignee）
  // ==================
  const assignees = await Promise.all([
    prisma.assignee.create({
      data: {
        name: '山田太郎',
        email: 'yamada@example.com'
      }
    }),
    prisma.assignee.create({
      data: {
        name: '佐藤花子',
        email: 'sato@example.com'
      }
    }),
    prisma.assignee.create({
      data: {
        name: '鈴木一郎',
        email: 'suzuki@example.com'
      }
    }),
    prisma.assignee.create({
      data: {
        name: '田中美咲',
        email: 'tanaka@example.com'
      }
    }),
    prisma.assignee.create({
      data: {
        name: '高橋健太',
        email: 'takahashi@example.com'
      }
    })
  ])
  console.log(`Created ${assignees.length} assignees`)

  // ==================
  // 8. Todoサンプルデータ作成
  // ==================

  const todoTitles = [
    '週次ミーティングの資料を作成',
    'データベースのバックアップを取る',
    '新機能の仕様書を確認',
    'バグ修正: ログイン画面のエラー',
    'テストケースを追加',
    'APIドキュメントを更新',
    'パフォーマンステストを実施',
    'セキュリティ監査の準備',
    'ユーザーフィードバックを分析',
    'デザインレビューに参加'
  ]

  const todoDescriptions = [
    '今週の進捗と来週の計画をまとめる',
    '毎週金曜日の定例作業',
    '開発チームとの打ち合わせ前に確認',
    '優先度高: 本番環境で発生中',
    'カバレッジ80%を目指す',
    '最新のエンドポイント情報を反映',
    '負荷テストツールを使用',
    '外部監査に向けた準備',
    '先月分のフィードバックを整理',
    'デザイナーとの定例会議'
  ]

  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

  // ProjectA1 に5個
  for (let i = 0; i < 5; i++) {
    const randomAssignee = Math.random() > 0.3 ? assignees[Math.floor(Math.random() * assignees.length)] : null
    const completed = Math.random() > 0.7

    await prisma.todo.create({
      data: {
        title: todoTitles[i],
        description: todoDescriptions[i],
        completed,
        tenantId: tenantA.id,
        projectId: projectA1.id,
        createdById: aliceUser.id,
        assigneeId: randomAssignee?.id,
        priority: priorities[Math.floor(Math.random() * priorities.length)]
      }
    })
  }

  // ProjectA2 に3個
  for (let i = 5; i < 8; i++) {
    const randomAssignee = Math.random() > 0.3 ? assignees[Math.floor(Math.random() * assignees.length)] : null
    const completed = Math.random() > 0.7

    await prisma.todo.create({
      data: {
        title: todoTitles[i % todoTitles.length],
        description: todoDescriptions[i % todoDescriptions.length],
        completed,
        tenantId: tenantA.id,
        projectId: projectA2.id,
        createdById: bobUser.id,
        assigneeId: randomAssignee?.id,
        priority: priorities[Math.floor(Math.random() * priorities.length)]
      }
    })
  }

  // ProjectB1 に2個
  for (let i = 8; i < 10; i++) {
    const randomAssignee = Math.random() > 0.3 ? assignees[Math.floor(Math.random() * assignees.length)] : null
    const completed = Math.random() > 0.7

    await prisma.todo.create({
      data: {
        title: todoTitles[i % todoTitles.length],
        description: todoDescriptions[i % todoDescriptions.length],
        completed,
        tenantId: tenantB.id,
        projectId: projectB1.id,
        createdById: daveUser.id,
        assigneeId: randomAssignee?.id,
        priority: priorities[Math.floor(Math.random() * priorities.length)]
      }
    })
  }

  console.log('Created 10 sample todos')

  console.log('Seed completed successfully!')
  console.log('\n=== Test Users ===')
  console.log('Global Admin: admin@example.com')
  console.log('\nTenantA Users:')
  console.log('  - alice@example.com (OWNER)')
  console.log('  - bob@example.com (ADMIN)')
  console.log('  - charlie@example.com (MEMBER)')
  console.log('\nTenantB Users:')
  console.log('  - dave@example.com (OWNER)')
  console.log('  - eve@example.com (ADMIN)')
  console.log('  - frank@example.com (MEMBER)')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
