import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = [
  '/dev-login'
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

  // セッションチェック（Cookie）
  const devUserId = request.cookies.get('dev-user-id')

  if (!devUserId) {
    return NextResponse.redirect(new URL('/dev-login', request.url))
  }

  // パス名をヘッダーに追加
  const response = NextResponse.next()
  response.headers.set('x-pathname', pathname)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
