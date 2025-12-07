import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"

// 本番環境でlocalhost:3000にフォールバックしないように検証
const getBaseURL = () => {
  const url = process.env.NEXT_PUBLIC_BETTER_AUTH_URL

  // 開発環境ではデフォルト値を使用
  if (process.env.NODE_ENV === 'development') {
    return url || "http://localhost:3000"
  }

  // 本番環境では環境変数が必須
  if (!url) {
    throw new Error('NEXT_PUBLIC_BETTER_AUTH_URL must be set in production')
  }

  return url
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [
    organizationClient(),
  ],
})

export const { signIn, signOut, useSession } = authClient
