'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'

type Result = { ok: boolean; error?: string }

/** Solo el solicitante puede tocar su propia cotización. */
async function loadOwned(id: number) {
  const user = await getCurrentUser()
  if (!user) return { user: null, doc: null }

  const payload = await getPayloadClient()
  const doc = await payload.findByID({ collection: 'cotizaciones', id, depth: 0 }).catch(() => null)
  if (!doc) return { user, doc: null }

  const solicitanteId = typeof doc.solicitante === 'object' ? doc.solicitante.id : doc.solicitante
  return { user, doc: solicitanteId === user.id ? doc : null }
}

export async function cancelarCotizacion(id: number): Promise<Result> {
  const { doc } = await loadOwned(id)
  if (!doc) return { ok: false, error: 'No encontramos esa cotización.' }
  if (doc.estado === 'respondida' || doc.estado === 'cerrada') {
    return { ok: false, error: 'Ya no se puede cancelar: el proveedor respondió.' }
  }

  const payload = await getPayloadClient()
  await payload.update({
    collection: 'cotizaciones',
    id,
    data: { estado: 'cancelada', preferidaAt: null },
  })
  revalidatePath('/mis-cotizaciones')
  return { ok: true }
}

export async function marcarPreferida(id: number): Promise<Result> {
  const { doc } = await loadOwned(id)
  if (!doc) return { ok: false, error: 'No encontramos esa cotización.' }
  if (doc.estado !== 'respondida') {
    return { ok: false, error: 'Solo podés elegir entre propuestas ya respondidas.' }
  }

  const payload = await getPayloadClient()
  await payload.update({
    collection: 'cotizaciones',
    id,
    data: { preferidaAt: doc.preferidaAt ? null : new Date().toISOString() },
  })
  revalidatePath('/mis-cotizaciones')
  return { ok: true }
}

export async function confirmarAvance(id: number): Promise<Result> {
  const { doc } = await loadOwned(id)
  if (!doc) return { ok: false, error: 'No encontramos esa cotización.' }
  if (doc.estado !== 'respondida') {
    return { ok: false, error: 'Todavía no hay una propuesta para confirmar.' }
  }

  const payload = await getPayloadClient()
  await payload.update({
    collection: 'cotizaciones',
    id,
    data: { avanceConfirmadoAt: new Date().toISOString() },
  })
  revalidatePath('/mis-cotizaciones')
  return { ok: true }
}
