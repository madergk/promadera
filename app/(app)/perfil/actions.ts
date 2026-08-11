'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'

export type PerfilState = { error?: string; ok?: boolean }

export async function guardarPerfil(
  _prev: PerfilState,
  formData: FormData,
): Promise<PerfilState> {
  const user = await getCurrentUser()
  if (!user) redirect('/auth?next=%2Fperfil')

  const nombreCompleto = String(formData.get('nombreCompleto') ?? '').trim()
  if (nombreCompleto.length < 2) return { error: 'Ingresá tu nombre completo.' }

  try {
    const payload = await getPayloadClient()
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        nombreCompleto,
        telefono: String(formData.get('telefono') ?? '').trim() || null,
        organizacion: String(formData.get('organizacion') ?? '').trim() || null,
        pais: String(formData.get('pais') ?? '').trim() || null,
        provincia: String(formData.get('provincia') ?? '').trim() || null,
        ciudad: String(formData.get('ciudad') ?? '').trim() || null,
        // `role`, `email` y `onboarded` no se tocan desde este formulario.
      },
    })
  } catch {
    return { error: 'No pudimos guardar los cambios. Intentá de nuevo.' }
  }

  revalidatePath('/perfil')
  return { ok: true }
}
