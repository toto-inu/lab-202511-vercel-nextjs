import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up existing data
  await prisma.todo.deleteMany()
  await prisma.assignee.deleteMany()
  await prisma.projectMember.deleteMany()
  await prisma.project.deleteMany()
  await prisma.tenantMember.deleteMany()
  await prisma.tenant.deleteMany()
  await prisma.user.deleteMany()
  await prisma.plan.deleteMany()

  // Create Plans
  const freePlan = await prisma.plan.create({
    data: {
      name: 'FREE',
      displayName: 'Free',
      maxProjects: 1,
      maxUsersPerTenant: 3,
      maxTodosPerProject: 10,
      features: JSON.stringify([])
    }
  })

  const proPlan = await prisma.plan.create({
    data: {
      name: 'PRO',
      displayName: 'Pro',
      maxProjects: 10,
      maxUsersPerTenant: 20,
      maxTodosPerProject: 1000,
      features: JSON.stringify(['priority', 'due_date'])
    }
  })

  const enterprisePlan = await prisma.plan.create({
    data: {
      name: 'ENTERPRISE',
      displayName: 'Enterprise',
      maxProjects: -1,
      maxUsersPerTenant: -1,
      maxTodosPerProject: -1,
      features: JSON.stringify(['priority', 'due_date', 'custom_fields', 'api_access'])
    }
  })

  console.log('✅ Plans created')

  // Create Users
  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice (Tenant A Owner)',
      isGlobalAdmin: false
    }
  })

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob (Tenant A Admin)',
      isGlobalAdmin: false
    }
  })

  const charlie = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      name: 'Charlie (Tenant B Owner)',
      isGlobalAdmin: false
    }
  })

  const david = await prisma.user.create({
    data: {
      email: 'david@example.com',
      name: 'David (Tenant A Member)',
      isGlobalAdmin: false
    }
  })

  const eve = await prisma.user.create({
    data: {
      email: 'eve@example.com',
      name: 'Eve (Tenant B Admin)',
      isGlobalAdmin: false
    }
  })

  const frank = await prisma.user.create({
    data: {
      email: 'frank@example.com',
      name: 'Frank (Tenant B Member)',
      isGlobalAdmin: false
    }
  })

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Global Admin',
      isGlobalAdmin: true
    }
  })

  console.log('✅ Users created')

  // Create Tenants
  const tenantA = await prisma.tenant.create({
    data: {
      name: 'Tenant A (Pro Plan)',
      slug: 'tenant-a',
      planId: proPlan.id
    }
  })

  const tenantB = await prisma.tenant.create({
    data: {
      name: 'Tenant B (Free Plan)',
      slug: 'tenant-b',
      planId: freePlan.id
    }
  })

  console.log('✅ Tenants created')

  // Create Tenant Memberships
  await prisma.tenantMember.createMany({
    data: [
      { userId: alice.id, tenantId: tenantA.id, role: 'OWNER' },
      { userId: bob.id, tenantId: tenantA.id, role: 'ADMIN' },
      { userId: david.id, tenantId: tenantA.id, role: 'MEMBER' },
      { userId: charlie.id, tenantId: tenantB.id, role: 'OWNER' },
      { userId: eve.id, tenantId: tenantB.id, role: 'ADMIN' },
      { userId: frank.id, tenantId: tenantB.id, role: 'MEMBER' }
    ]
  })

  console.log('✅ Tenant memberships created')

  // Create Projects
  const projectA1 = await prisma.project.create({
    data: {
      name: 'Project Alpha (Tenant A)',
      slug: 'project-alpha',
      description: 'First project for Tenant A',
      tenantId: tenantA.id
    }
  })

  const projectA2 = await prisma.project.create({
    data: {
      name: 'Project Beta (Tenant A)',
      slug: 'project-beta',
      description: 'Second project for Tenant A',
      tenantId: tenantA.id
    }
  })

  const projectB1 = await prisma.project.create({
    data: {
      name: 'Project Gamma (Tenant B)',
      slug: 'project-gamma',
      description: 'First project for Tenant B',
      tenantId: tenantB.id
    }
  })

  console.log('✅ Projects created')

  // Create Project Memberships
  await prisma.projectMember.createMany({
    data: [
      { userId: alice.id, projectId: projectA1.id, role: 'ADMIN' },
      { userId: bob.id, projectId: projectA1.id, role: 'EDITOR' },
      { userId: david.id, projectId: projectA1.id, role: 'VIEWER' },
      { userId: alice.id, projectId: projectA2.id, role: 'ADMIN' },
      { userId: bob.id, projectId: projectA2.id, role: 'ADMIN' },
      { userId: charlie.id, projectId: projectB1.id, role: 'ADMIN' },
      { userId: eve.id, projectId: projectB1.id, role: 'EDITOR' },
      { userId: frank.id, projectId: projectB1.id, role: 'VIEWER' }
    ]
  })

  console.log('✅ Project memberships created')

  // Create Assignees
  const assignee1 = await prisma.assignee.create({
    data: {
      name: '山田太郎',
      email: 'yamada@example.com'
    }
  })

  const assignee2 = await prisma.assignee.create({
    data: {
      name: '佐藤花子',
      email: 'sato@example.com'
    }
  })

  const assignee3 = await prisma.assignee.create({
    data: {
      name: '鈴木次郎',
      email: 'suzuki@example.com'
    }
  })

  const assignee4 = await prisma.assignee.create({
    data: {
      name: '田中美咲',
      email: 'tanaka@example.com'
    }
  })

  const assignee5 = await prisma.assignee.create({
    data: {
      name: '高橋健一',
      email: 'takahashi@example.com'
    }
  })

  console.log('✅ Assignees created')

  // Create Todos for Project Alpha (Tenant A)
  await prisma.todo.createMany({
    data: [
      {
        title: 'データベース設計を完了する',
        description: 'ER図を作成し、スキーマ定義を行う',
        completed: false,
        tenantId: tenantA.id,
        projectId: projectA1.id,
        assigneeId: assignee1.id,
        createdById: alice.id,
        priority: 'HIGH',
        dueDate: new Date('2025-12-10')
      },
      {
        title: 'API仕様書を作成する',
        description: 'OpenAPI形式でREST APIを定義',
        completed: false,
        tenantId: tenantA.id,
        projectId: projectA1.id,
        assigneeId: assignee2.id,
        createdById: alice.id,
        priority: 'MEDIUM'
      },
      {
        title: 'ユニットテストを書く',
        description: 'コアロジックのテストカバレッジ80%以上を目指す',
        completed: true,
        tenantId: tenantA.id,
        projectId: projectA1.id,
        assigneeId: assignee1.id,
        createdById: bob.id,
        priority: 'HIGH'
      },
      {
        title: 'UIデザインレビュー',
        description: 'Figmaデザインのレビューと承認',
        completed: false,
        tenantId: tenantA.id,
        projectId: projectA1.id,
        assigneeId: assignee3.id,
        createdById: bob.id,
        priority: 'LOW'
      }
    ]
  })

  // Create Todos for Project Beta (Tenant A)
  await prisma.todo.createMany({
    data: [
      {
        title: 'CI/CDパイプラインを構築',
        description: 'GitHub Actionsでビルド・テスト・デプロイを自動化',
        completed: false,
        tenantId: tenantA.id,
        projectId: projectA2.id,
        assigneeId: assignee2.id,
        createdById: alice.id,
        priority: 'HIGH',
        dueDate: new Date('2025-12-15')
      },
      {
        title: 'セキュリティ監査',
        description: '依存パッケージの脆弱性チェック',
        completed: false,
        tenantId: tenantA.id,
        projectId: projectA2.id,
        assigneeId: assignee3.id,
        createdById: bob.id,
        priority: 'MEDIUM'
      }
    ]
  })

  // Create Todos for Project Gamma (Tenant B)
  await prisma.todo.createMany({
    data: [
      {
        title: 'ランディングページを作成',
        description: 'マーケティング向けLPのコーディング',
        completed: false,
        tenantId: tenantB.id,
        projectId: projectB1.id,
        assigneeId: assignee4.id,
        createdById: charlie.id,
        priority: 'HIGH'
      },
      {
        title: 'メールテンプレート作成',
        description: 'ウェルカムメール、パスワードリセットなど',
        completed: true,
        tenantId: tenantB.id,
        projectId: projectB1.id,
        assigneeId: assignee5.id,
        createdById: charlie.id,
        priority: 'LOW'
      },
      {
        title: 'ドキュメント整備',
        description: 'READMEとユーザーガイドを更新',
        completed: false,
        tenantId: tenantB.id,
        projectId: projectB1.id,
        assigneeId: assignee4.id,
        createdById: eve.id,
        priority: 'MEDIUM'
      },
      {
        title: 'パフォーマンステスト',
        description: '負荷テストを実施して最適化',
        completed: false,
        tenantId: tenantB.id,
        projectId: projectB1.id,
        assigneeId: assignee5.id,
        createdById: eve.id,
        priority: 'LOW'
      }
    ]
  })

  console.log('✅ Todos created')

  console.log('🎉 Seeding completed!')
  console.log('\n📊 Summary:')
  console.log(`  - ${3} Plans`)
  console.log(`  - ${7} Users`)
  console.log(`  - ${2} Tenants`)
  console.log(`  - ${3} Projects`)
  console.log(`  - ${5} Assignees`)
  console.log(`  - ${10} Todos`)
  console.log('\n👥 Test Users:')
  console.log('  - admin@example.com (Global Admin)')
  console.log('  - alice@example.com (Tenant A Owner)')
  console.log('  - bob@example.com (Tenant A Admin)')
  console.log('  - david@example.com (Tenant A Member)')
  console.log('  - charlie@example.com (Tenant B Owner)')
  console.log('  - eve@example.com (Tenant B Admin)')
  console.log('  - frank@example.com (Tenant B Member)')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
