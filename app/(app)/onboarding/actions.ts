'use server'

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import type { ProfileType } from '@/payload/collections/Users'

export type OnboardingState = { error?: string }

const safeNext = (next: FormDataEntryValue | null): string => {
  const value = typeof next === 'string' ? next : ''
  return value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const user = await getCurrentUser()
  if (!user) redirect('/auth?next=%2Fonboarding')

  const profileType = String(formData.get('profileType') ?? '') as ProfileType
  const nombreCompleto = String(formData.get('nombreCompleto') ?? '').trim()
  const ciudad = String(formData.get('ciudad') ?? '').trim()
  const next = safeNext(formData.get('next'))

  if (!profileType) return { error: 'Elegí un tipo de perfil.' }
  if (nombreCompleto.length < 2) return { error: 'Ingresá tu nombre completo.' }
  if (!ciudad) return { error: 'Ingresá tu ciudad.' }

  try {
    const payload = await getPayloadClient()
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        profileType,
        nombreCompleto,
        ciudad,
        telefono: String(formData.get('telefono') ?? '').trim() || undefined,
        organizacion: String(formData.get('organizacion') ?? '').trim() || undefined,
        pais: String(formData.get('pais') ?? '').trim() || undefined,
        provincia: String(formData.get('provincia') ?? '').trim() || undefined,
        notas: String(formData.get('notas') ?? '').trim() || undefined,
        intereses: formData
          .getAll('intereses')
          .map((i) => String(i))
          .filter(Boolean)
          .map((interes) => ({ interes })),
        onboarded: true,
        // `role` se omite a propósito: no se toca desde el formulario.
      },
    })
  } catch {
    return { error: 'No pudimos guardar tu perfil. Intentá de nuevo.' }
  }

  // Quien ofrece productos o servicios sigue al alta de proveedor.
  redirect(profileType === 'empresa' || profileType === 'productor' ? '/proveedores/alta' : next)
}
