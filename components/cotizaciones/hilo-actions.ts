'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'

export interface HiloItem {
  id: number
  accion: string
  mensaje: string | null
  estadoAnterior: string | null
  estadoNuevo: string | null
  autorId: number | null
  autorNombre: string | null
  createdAt: string
  esMio: boolean
}

export async function listarHilo(cotizacionId: number): Promise<HiloItem[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'cotizacion-updates',
    where: { cotizacion: { equals: cotizacionId } },
    sort: 'createdAt',
    limit: 200,
    depth: 1,
    user,
    overrideAccess: false,
  })

  return docs.map((d) => {
    const autor = typeof d.autor === 'object' ? d.autor : null
    return {
      id: d.id,
      accion: d.accion,
      mensaje: d.mensaje ?? null,
      estadoAnterior: d.estadoAnterior ?? null,
      estadoNuevo: d.estadoNuevo ?? null,
      autorId: autor?.id ?? (typeof d.autor === 'number' ? d.autor : null),
      autorNombre: autor?.nombreCompleto ?? null,
      createdAt: d.createdAt,
      esMio: (autor?.id ?? d.autor) === user.id,
    }
  })
}

export async function enviarMensajeHilo(
  cotizacionId: number,
  mensaje: string,
  revalidatePathTo: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Sesión expirada.' }
  const texto = mensaje.trim().slice(0, 4000)
  if (!texto) return { ok: false, error: 'Escribí un mensaje.' }

  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'cotizacion-updates',
      data: { cotizacion: cotizacionId, autor: user.id, accion: 'mensaje', mensaje: texto },
      user,
      overrideAccess: false,
    })
  } catch {
    return { ok: false, error: 'No pudimos enviar el mensaje.' }
  }

  revalidatePath(revalidatePathTo)
  return { ok: true }
}
