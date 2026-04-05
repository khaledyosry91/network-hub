import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (c) =>
          c.forEach(({ name, value, ...o }) => res.cookies.set(name, value, o)),
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const isAuth = req.nextUrl.pathname.startsWith('/auth')
  const isInvite = req.nextUrl.pathname.startsWith('/invite')

  if (!user && !isAuth && !isInvite)
    return NextResponse.redirect(new URL('/auth', req.url))
  if (user && isAuth)
    return NextResponse.redirect(new URL('/hub', req.url))
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}