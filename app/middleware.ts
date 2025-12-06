import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = [
  '/sign-in'
]

export async function middleware(request: NextRequest) {
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

  // セッションチェック（Better Auth Cookie）
  const session = request.cookies.get('better-auth.session_token')

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
