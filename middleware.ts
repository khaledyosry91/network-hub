import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('sb-access-token') ||
    req.cookies.getAll().find(c => c.name.includes('auth-token'))

  const isAuth = req.nextUrl.pathname.startsWith('/auth')
  const isInvite = req.nextUrl.pathname.startsWith('/invite')

  if (!token && !isAuth && !isInvite) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|api).*)',
  ],
}