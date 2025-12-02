import { getDevUsers, devLogin } from '@/actions/dev-auth'
import { getCurrentDevUserId } from '@/lib/dev-auth'
import { redirect } from 'next/navigation'

export default async function DevLoginPage() {
  // すでにログイン済みの場合はホームへリダイレクト
  const userId = await getCurrentDevUserId()
  if (userId) {
    redirect('/')
  }

  const users = await getDevUsers()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow-lg rounded-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            開発用ログイン
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            テスト用ユーザーを選択してください
          </p>
        </div>

        <form action={devLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
              ユーザーを選択
            </label>
            <select
              id="userId"
              name="userId"
              required
              className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
            >
              <option value="">-- ユーザーを選択 --</option>

              {/* グローバル管理者 */}
              {users
                .filter(u => u.isGlobalAdmin)
                .map(user => (
                  <option key={user.id} value={user.id}>
                    👑 {user.name} ({user.email})
                  </option>
                ))}

              {/* 区切り */}
              {users.some(u => u.isGlobalAdmin) && users.some(u => !u.isGlobalAdmin) && (
                <option disabled>─────────────</option>
              )}

              {/* 一般ユーザー */}
              {users
                .filter(u => !u.isGlobalAdmin)
                .map(user => {
                  const memberships = user.tenantMemberships
                    .map(m => `${m.tenant.name}: ${m.role}`)
                    .join(', ')

                  return (
                    <option key={user.id} value={user.id}>
                      {user.name} - {memberships}
                    </option>
                  )
                })}
            </select>

            {/* ユーザー詳細情報 */}
            <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-600">
              <p className="font-semibold mb-2">ユーザー一覧:</p>
              <ul className="space-y-1">
                {users
                  .filter(u => u.isGlobalAdmin)
                  .map(user => (
                    <li key={user.id}>
                      👑 <strong>{user.email}</strong> - グローバル管理者
                    </li>
                  ))}
                {users
                  .filter(u => !u.isGlobalAdmin)
                  .map(user => (
                    <li key={user.id}>
                      • <strong>{user.email}</strong>
                      {user.tenantMemberships.map(m => (
                        <span key={m.id} className="ml-2 text-xs">
                          {m.tenant.name} ({m.role})
                        </span>
                      ))}
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ログイン
            </button>
          </div>
        </form>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800">
            <strong>注意:</strong> これは開発・テスト専用のログイン画面です。
            本番環境では使用しないでください。
          </p>
        </div>
      </div>
    </div>
  )
}
