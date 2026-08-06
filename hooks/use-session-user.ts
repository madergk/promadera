'use client'

import { useEffect, useState } from 'react'
import type { User } from '@/payload-types'

export type SessionUser = Pick<User, 'id' | 'email' | 'role' | 'nombreCompleto' | 'onboarded'>

/**
 * Resuelve la sesión en el cliente contra /api/users/me.
 *
 * Se hace client-side a propósito: leer la cookie en el layout server-side
 * volvería dinámicas todas las páginas y perderíamos el prerender estático,
 * que es lo que le importa al SEO de las páginas públicas.
 */
export function useSessionUser() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    fetch('/api/users/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) setUser(data?.user ?? null)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { user, loading }
}
