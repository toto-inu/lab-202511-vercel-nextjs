'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { LogIn, LogOut, User, Shield } from 'lucide-react'
import { signOutAction } from '@/actions/auth'
import type { Session } from 'next-auth'

interface AuthButtonProps {
  session: Session | null
}

export function AuthButton({ session }: AuthButtonProps) {
  const [isPending, startTransition] = useTransition()

  if (!session) {
    return (
      <Link
        href="/auth/signin"
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      >
        <LogIn className="h-4 w-4" />
        ログイン
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || ''}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <User className="h-5 w-5" />
        )}
        <span className="hidden sm:inline">{session.user.name || session.user.email}</span>
        {session.user.role === 'ADMIN' && (
          <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
            <Shield className="h-3 w-3" />
            Admin
          </span>
        )}
      </div>

      {session.user.role === 'ADMIN' && (
        <Link
          href="/admin/users"
          className="text-sm text-purple-600 hover:text-purple-800 font-medium"
        >
          ユーザー管理
        </Link>
      )}

      <button
        onClick={() => startTransition(() => signOutAction())}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
      >
        <LogOut className="h-4 w-4" />
        {isPending ? 'ログアウト中...' : 'ログアウト'}
      </button>
    </div>
  )
}
