import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAuth = pathname.startsWith('/auth')
  const isInvite = pathname.startsWith('/invite')
  const isStatic = pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')

  if (isStatic || isAuth || isInvite) {
    return NextResponse.next()
  }

  const hasCookie = req.cookies.getAll().some(c =>
    c.name.includes('supabase') || c.name.includes('sb-')
  )

  if (!hasCookie) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
