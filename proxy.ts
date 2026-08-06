import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE } from '@/lib/auth/cookie'

/**
 * Chequeo barato de presencia de cookie para evitar renderizar rutas privadas
 * a visitantes anónimos. NO valida el token: el proxy corre en el edge y no
 * puede usar la Local API de Payload. La verificación real (y la de rol) se
 * hace server-side en cada página con requireUser/requireRole.
 */
export default function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)

  if (!token) {
    const url = new URL('/auth', request.url)
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/perfil/:path*',
    '/mis-cotizaciones/:path*',
    '/panel-proveedor/:path*',
    '/onboarding/:path*',
  ],
}
