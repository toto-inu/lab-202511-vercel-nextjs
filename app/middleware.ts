import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

// 認証不要なパス
const publicPaths = ['/auth/signin', '/auth/signup']

export default auth((req) => {
  const { pathname } = req.nextUrl

  // 認証不要なパスはスキップ
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // API 認証パスはスキップ
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // 未認証の場合はログインページへリダイレクト
  if (!req.auth) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Admin ページは ADMIN のみアクセス可能
  if (pathname.startsWith('/admin') && req.auth.user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
