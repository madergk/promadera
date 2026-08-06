'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AUTH_COOKIE } from '@/lib/auth/cookie'
import { getPayloadClient } from '@/lib/payload'

export type AuthState = { error?: string; sentTo?: string }

const setSessionCookie = async (token: string, exp?: number) => {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    ...(exp ? { expires: new Date(exp * 1000) } : {}),
  })
}

/** Destino seguro post-login: solo rutas internas, nunca URLs absolutas. */
const safeNext = (next: FormDataEntryValue | null): string => {
  const value = typeof next === 'string' ? next : ''
  return value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

export async function loginAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const next = safeNext(formData.get('next'))

  let destination = next

  try {
    const payload = await getPayloadClient()
    const result = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    if (!result?.token) return { error: 'No pudimos iniciar sesión. Revisá tus datos.' }

    await setSessionCookie(result.token, result.exp)

    if (result.user && !(result.user as { onboarded?: boolean }).onboarded) {
      destination = `/onboarding?next=${encodeURIComponent(next)}`
    }
  } catch {
    return { error: 'Credenciales inválidas. Revisá tu email y contraseña.' }
  }

  redirect(destination)
}

export async function signupAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const nombreCompleto = String(formData.get('nombreCompleto') ?? '')
  const next = safeNext(formData.get('next'))

  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  }

  try {
    const payload = await getPayloadClient()

    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    })

    if (existing.totalDocs > 0) {
      return { error: 'Ya existe una cuenta con ese email.' }
    }

    // Local API: el rol se fija acá y nunca se toma del formulario.
    await payload.create({
      collection: 'users',
      data: { email, password, nombreCompleto, role: 'cliente', onboarded: false },
    })

    const result = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    if (result?.token) await setSessionCookie(result.token, result.exp)
  } catch {
    return { error: 'No pudimos crear tu cuenta. Intentá de nuevo.' }
  }

  redirect(`/onboarding?next=${encodeURIComponent(next)}`)
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE)
  redirect('/')
}
