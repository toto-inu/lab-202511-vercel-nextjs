import Link from 'next/link'
import { CheckSquare, User } from 'lucide-react'
import { getCurrentDevUserId, getDevUser } from '@/lib/dev-auth'
import LogoutButton from '@/components/LogoutButton'

export default async function Navigation() {
  const userId = await getCurrentDevUserId()
  const user = await getDevUser(userId)

  const links = [
    { href: '/', label: 'Todo一覧' },
    { href: '/assignees', label: '担当者一覧' },
  ]

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
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  {user.isGlobalAdmin ? (
                    <span className="text-xs text-muted-foreground">👑 グローバル管理者</span>
                  ) : (
                    user.tenantMemberships.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {user.tenantMemberships[0].tenant.name} ({user.tenantMemberships[0].role})
                      </span>
                    )
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
