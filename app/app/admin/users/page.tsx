import { getUsers } from '@/actions/user'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { UserList } from '@/components/UserList'

export default async function AdminUsersPage() {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const users = await getUsers()

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">ユーザー管理</h1>
          <p className="text-muted-foreground mt-1">
            {users.length} 人のユーザー
          </p>
        </div>
      </div>

      <UserList users={users} currentUserId={session.user.id} />
    </div>
  )
}
