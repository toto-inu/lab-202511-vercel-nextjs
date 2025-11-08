'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckSquare } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()

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
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
