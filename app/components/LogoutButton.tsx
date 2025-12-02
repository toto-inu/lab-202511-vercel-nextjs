'use client'

import { LogOut } from 'lucide-react'
import { devLogout } from '@/actions/dev-auth'

export default function LogoutButton() {
  return (
    <form action={devLogout}>
      <button
        type="submit"
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
        title="ログアウト"
      >
        <LogOut className="h-4 w-4" />
        <span>ログアウト</span>
      </button>
    </form>
  )
}
