import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const publicPaths = [
  '/sign-in'
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routesはスキップ
  if (publicPaths.some(path => pathname.startsWith(path))) {
    const response = NextResponse.next()
    response.headers.set('x-pathname', pathname)
    return response
  }

  // 静的ファイルをスキップ
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Better Auth セッションチェック
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // パス名をヘッダーに追加
  const response = NextResponse.next()
  response.headers.set('x-pathname', pathname)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
