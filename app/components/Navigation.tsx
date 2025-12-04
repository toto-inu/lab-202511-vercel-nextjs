import Link from 'next/link'
import { CheckSquare, User } from 'lucide-react'
import { getCurrentDevUserId, getDevUser } from '@/lib/dev-auth'
import { getCurrentTenantId, getUserTenants } from '@/lib/auth/tenant-context'
import LogoutButton from '@/components/LogoutButton'
import TenantSwitcher from '@/components/TenantSwitcher'

export default async function Navigation() {
  const userId = await getCurrentDevUserId()

  // ユーザーIDがない場合は早期リターン
  if (!userId) {
    return null
  }

  const user = await getDevUser(userId)

  // ユーザーが見つからない場合も早期リターン
  if (!user) {
    return null
  }

  const links = [
    { href: '/projects', label: 'プロジェクト' },
    { href: '/assignees', label: '担当者一覧' },
    { href: '/settings/members', label: 'メンバー' },
    { href: '/settings/plan', label: 'プラン' },
  ]

  // Tenantリストと現在のTenantIDを取得
  let tenants: any[] = []
  let currentTenantId: string | null = null

  try {
    tenants = await getUserTenants()
    currentTenantId = await getCurrentTenantId()

    // currentTenantIdがない場合は最初のTenantを使用
    if (!currentTenantId && tenants.length > 0) {
      currentTenantId = tenants[0].id
    }
  } catch (error) {
    console.error('Error loading tenants:', error)
  }

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
              <CheckSquare className="h-6 w-6 text-primary" />
              <span>Todo App</span>
            </Link>
            <div className="flex gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              {/* Tenant Switcher */}
              {tenants.length > 0 && currentTenantId && (
                <TenantSwitcher tenants={tenants} currentTenantId={currentTenantId} />
              )}

              {/* User Info */}
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  {user.isGlobalAdmin && (
                    <span className="text-xs text-muted-foreground">👑 グローバル管理者</span>
                  )}
                </div>
              </div>
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
