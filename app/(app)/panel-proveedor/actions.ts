'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { toPayloadFile } from '@/lib/payload/upload-file'
import type { EstadoCotizacion } from '@/payload/collections/Cotizaciones'

type Result = { ok: boolean; error?: string }

/** Verifica que el usuario sea dueño de la empresa a la que llegó la cotización. */
async function requireProveedorDeCotizacion(cotizacionId: number) {
  const user = await getCurrentUser()
  if (!user) redirect(`/auth?next=${encodeURIComponent(`/panel-proveedor/${cotizacionId}`)}`)

  const payload = await getPayloadClient()
  const cot = await payload.findByID({ collection: 'cotizaciones', id: cotizacionId, depth: 1 }).catch(() => null)
  if (!cot) return { user, payload, cot: null, empresaOwnerId: null }

  const empresa = typeof cot.empresa === 'object' ? cot.empresa : null
  const empresaOwnerId = typeof empresa?.user === 'object' ? empresa.user?.id : empresa?.user
  return { user, payload, cot, empresaOwnerId }
}

export async function subirPresupuestoPdf(cotizacionId: number, formData: FormData): Promise<Result & { id?: number }> {
  const { user, payload, empresaOwnerId } = await requireProveedorDeCotizacion(cotizacionId)
  if (empresaOwnerId !== user?.id) return { ok: false, error: 'No autorizado.' }

  const file = formData.get('file')
  if (!(file instanceof File)) return { ok: false, error: 'Archivo inválido.' }
  if (file.type !== 'application/pdf') return { ok: false, error: 'El presupuesto debe ser un PDF.' }
  if (file.size > 8 * 1024 * 1024) return { ok: false, error: 'El archivo no puede superar 8 MB.' }

  try {
    const doc = await payload.create({
      collection: 'documentos',
      data: { nombre: `Presupuesto ${file.name}` },
      file: await toPayloadFile(file),
      user,
      overrideAccess: false,
    })
    return { ok: true, id: doc.id }
  } catch {
    return { ok: false, error: 'No pudimos subir el archivo.' }
  }
}

export async function guardarPresupuesto(
  cotizacionId: number,
  data: {
    montoStr: string
    moneda: string
    validezStr: string
    plazoEjec: string
    respuesta: string
    archivoId: number | null
    marcarRespondida: boolean
  },
): Promise<Result> {
  const { user, payload, cot, empresaOwnerId } = await requireProveedorDeCotizacion(cotizacionId)
  if (!cot || empresaOwnerId !== user?.id) return { ok: false, error: 'No autorizado.' }

  if (data.marcarRespondida) {
    if (!data.respuesta.trim()) return { ok: false, error: 'Escribí un mensaje para el cliente.' }
    if (!data.montoStr.trim()) return { ok: false, error: 'Cargá el monto del presupuesto.' }
  }

  const monto = data.montoStr.trim() ? Number(data.montoStr.replace(',', '.')) : null
  if (data.montoStr.trim() && (monto === null || Number.isNaN(monto) || monto < 0)) {
    return { ok: false, error: 'El monto no es válido.' }
  }
  const validez = data.validezStr.trim() ? Number.parseInt(data.validezStr, 10) : null
  if (data.validezStr.trim() && (validez === null || Number.isNaN(validez) || validez < 0)) {
    return { ok: false, error: 'La validez en días no es válida.' }
  }

  const estadoAnterior = cot.estado as EstadoCotizacion
  const estadoNuevo: EstadoCotizacion = data.marcarRespondida
    ? 'respondida'
    : estadoAnterior === 'enviada'
      ? 'en_revision'
      : estadoAnterior

  try {
    await payload.update({
      collection: 'cotizaciones',
      id: cotizacionId,
      data: {
        presupuestoMonto: monto,
        presupuestoMoneda: data.montoStr.trim() ? (data.moneda as 'ARS' | 'USD' | 'EUR') : null,
        presupuestoValidezDias: validez,
        presupuestoPlazo: data.plazoEjec.trim() || null,
        presupuestoArchivo: data.archivoId ?? undefined,
        respuesta: data.respuesta.trim() || null,
        estado: estadoNuevo,
        respondidaAt: data.marcarRespondida ? new Date().toISOString() : cot.respondidaAt,
      },
      user,
      overrideAccess: false,
    })

    await payload.create({
      collection: 'cotizacion-updates',
      data: {
        cotizacion: cotizacionId,
        autor: user!.id,
        accion: data.marcarRespondida ? 'presupuesto_enviado' : 'presupuesto_borrador',
        mensaje: data.marcarRespondida ? data.respuesta.trim() || null : null,
      },
      user,
      overrideAccess: false,
    })

    if (estadoAnterior !== estadoNuevo) {
      await payload.create({
        collection: 'cotizacion-updates',
        data: {
          cotizacion: cotizacionId,
          autor: user!.id,
          accion: 'estado',
          estadoAnterior,
          estadoNuevo,
          mensaje: data.marcarRespondida ? data.respuesta.trim() || null : null,
        },
        user,
        overrideAccess: false,
      })
    }
  } catch {
    return { ok: false, error: 'No pudimos guardar la respuesta.' }
  }

  revalidatePath('/panel-proveedor')
  revalidatePath(`/panel-proveedor/${cotizacionId}`)
  return { ok: true }
}
