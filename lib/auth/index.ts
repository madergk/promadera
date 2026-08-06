import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'

export { AUTH_COOKIE } from './cookie'

/** Usuario de la request actual, o null. Seguro de llamar en cualquier Server Component. */
export async function getCurrentUser(): Promise<User | null> {
  const payload = await getPayloadClient()
  const headers = await nextHeaders()
  const { user } = await payload.auth({ headers })
  return (user as User) ?? null
}

/**
 * Exige sesión. Si no hay, redirige a /auth conservando el destino
 * para volver después del login.
 */
export async function requireUser(currentPath?: string): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    const next = currentPath ? `?next=${encodeURIComponent(currentPath)}` : ''
    redirect(`/auth${next}`)
  }
  return user
}

/** Exige sesión con alguno de los roles dados. */
export async function requireRole(
  roles: Array<User['role']>,
  currentPath?: string,
): Promise<User> {
  const user = await requireUser(currentPath)
  if (!roles.includes(user.role)) redirect('/')
  return user
}

export const isAdminUser = (user: User | null): boolean => user?.role === 'admin'
