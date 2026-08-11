import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE } from '@/lib/auth/cookie'

const PRIVATE_PATHS = ['/perfil', '/mis-cotizaciones', '/panel-proveedor', '/onboarding']

/**
 * Chequeo barato de presencia de cookie para evitar renderizar rutas privadas
 * a visitantes anónimos. NO valida el token: el proxy corre en el edge y no
 * puede usar la Local API de Payload. La verificación real (y la de rol) se
 * hace server-side en cada página con requireUser/requireRole.
 */
export default function proxy(request: NextRequest) {
  const gate = checkBasicAuth(request)
  if (gate) return gate

  const isPrivate = PRIVATE_PATHS.some((p) => request.nextUrl.pathname.startsWith(p))
  if (isPrivate) {
    const token = request.cookies.get(AUTH_COOKIE)
    if (!token) {
      const url = new URL('/auth', request.url)
      url.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

/**
 * Gate temporal mientras el sitio no está lanzado (Vercel Hobby no permite
 * proteger producción con dominio custom). Se activa solo si están seteadas
 * SITE_BASIC_AUTH_USER / SITE_BASIC_AUTH_PASS; sacarlas al lanzar.
 */
function checkBasicAuth(request: NextRequest) {
  const user = process.env.SITE_BASIC_AUTH_USER
  const pass = process.env.SITE_BASIC_AUTH_PASS
  if (!user || !pass) return null

  const header = request.headers.get('authorization')
  if (header?.startsWith('Basic ')) {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf-8')
    const sep = decoded.indexOf(':')
    if (decoded.slice(0, sep) === user && decoded.slice(sep + 1) === pass) return null
  }

  return new NextResponse('Autenticación requerida', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="promadera"' },
  })
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
