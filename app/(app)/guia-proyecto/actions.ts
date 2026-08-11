'use server'

import { getCurrentUser } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/payload/media'

export type Brief = {
  resumen: string
  estimaciones: string[]
  siguientes_pasos: string[]
  rubros: string[]
  descripcion_para_proveedor: string
}

export type DraftItem = {
  id: number
  refSlug: string | null
  titulo: string | null
  wizardStep: number
  tipo: 'vivienda' | 'exterior' | null
  subtipo: string | null
  superficie: string | null
  ubicacion: string | null
  plazo: string | null
  presupuesto: string | null
  terminaciones: string[]
  notas: string | null
  brief: Brief | null
  updatedAt: string
}

const toDraftItem = (d: {
  id: number
  refSlug?: string | null
  titulo?: string | null
  wizardStep?: number | null
  tipo?: 'vivienda' | 'exterior' | null
  subtipo?: string | null
  superficie?: string | null
  ubicacion?: string | null
  plazo?: string | null
  presupuesto?: string | null
  terminaciones?: { valor: string }[] | null
  notas?: string | null
  brief?: unknown
  updatedAt: string
}): DraftItem => ({
  id: d.id,
  refSlug: d.refSlug ?? null,
  titulo: d.titulo ?? null,
  wizardStep: d.wizardStep ?? 0,
  tipo: d.tipo ?? null,
  subtipo: d.subtipo ?? null,
  superficie: d.superficie ?? null,
  ubicacion: d.ubicacion ?? null,
  plazo: d.plazo ?? null,
  presupuesto: d.presupuesto ?? null,
  terminaciones: (d.terminaciones ?? []).map((t) => t.valor),
  notas: d.notas ?? null,
  brief: (d.brief as Brief | null) ?? null,
  updatedAt: d.updatedAt,
})

export async function listarBorradores(): Promise<DraftItem[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'proyecto-drafts',
    where: { user: { equals: user.id } },
    sort: '-updatedAt',
    limit: 10,
    depth: 0,
    overrideAccess: false,
    user,
  })

  return docs.map(toDraftItem)
}

export type GuardarBorradorInput = {
  draftId?: number | null
  refSlug?: string | null
  titulo: string
  step: number
  tipo: 'vivienda' | 'exterior' | ''
  subtipo: string
  superficie: string
  ubicacion: string
  plazo: string
  presupuesto: string
  terminaciones: string[]
  notas: string
  brief: Brief | null
}

export async function guardarBorrador(
  input: GuardarBorradorInput,
): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'No hay sesión activa.' }

  const payload = await getPayloadClient()
  const data = {
    refSlug: input.refSlug || null,
    titulo: input.titulo || null,
    wizardStep: input.step,
    tipo: input.tipo || null,
    subtipo: input.subtipo || null,
    superficie: input.superficie || null,
    ubicacion: input.ubicacion || null,
    plazo: input.plazo || null,
    presupuesto: input.presupuesto || null,
    terminaciones: input.terminaciones.map((valor) => ({ valor })),
    notas: input.notas || null,
    brief: input.brief,
  }

  try {
    if (input.draftId) {
      const updated = await payload.update({
        collection: 'proyecto-drafts',
        id: input.draftId,
        data,
        overrideAccess: false,
        user,
      })
      return { ok: true, id: updated.id }
    }
    const created = await payload.create({
      collection: 'proyecto-drafts',
      data: { ...data, user: user.id },
      overrideAccess: false,
      user,
    })
    return { ok: true, id: created.id }
  } catch {
    return { ok: false, error: 'No pudimos guardar el borrador.' }
  }
}

export async function eliminarBorrador(id: number): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'No hay sesión activa.' }

  const payload = await getPayloadClient()
  try {
    await payload.delete({
      collection: 'proyecto-drafts',
      id,
      overrideAccess: false,
      user,
    })
    return { ok: true }
  } catch {
    return { ok: false, error: 'No pudimos eliminar el borrador.' }
  }
}

export type EmpresaCard = {
  id: number
  nombre: string
  slug: string
  sector: string | null
  servicios: string[]
  ubicacion: string | null
  logoUrl: string | null
}

export async function buscarEmpresaPorId(id: number): Promise<EmpresaCard | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'empresas',
    where: { and: [{ id: { equals: id } }, { publicada: { equals: true } }, { estado: { equals: 'publicado' } }] },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  const e = docs[0]
  if (!e) return null
  return {
    id: e.id,
    nombre: e.nombre,
    slug: e.slug,
    sector: e.sector ?? null,
    servicios: (e.servicios ?? []).map((s) => s.servicio),
    ubicacion: e.ubicacion ?? null,
    logoUrl: mediaUrl(e.logo),
  }
}

export async function buscarProveedores(rubros: string[]): Promise<EmpresaCard[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'empresas',
    where: { and: [{ publicada: { equals: true } }, { estado: { equals: 'publicado' } }] },
    limit: 80,
    depth: 1,
    overrideAccess: false,
  })

  const all: EmpresaCard[] = docs.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    slug: e.slug,
    sector: e.sector ?? null,
    servicios: (e.servicios ?? []).map((s) => s.servicio),
    ubicacion: e.ubicacion ?? null,
    logoUrl: mediaUrl(e.logo),
  }))

  const rubrosLower = rubros.map((r) => r.toLowerCase())
  const score = (e: EmpresaCard) => {
    const haystack = [e.sector ?? '', ...e.servicios].join(' ').toLowerCase()
    return rubrosLower.reduce((acc, r) => acc + (haystack.includes(r) ? 1 : 0), 0)
  }
  const sorted = all.map((e) => ({ e, s: score(e) })).sort((a, b) => b.s - a.s)
  const matched = sorted.filter(({ s }) => s > 0).map(({ e }) => e)
  const list = matched.length >= 3 ? matched : sorted.map(({ e }) => e)
  return list.slice(0, 12)
}

export type EnviarCotizacionesInput = {
  empresaIds: number[]
  draftId?: number | null
  referencia: string
  descripcion: string
  cantidad: string
  plazo: string
  ubicacion: string
  presupuesto: string
}

export async function enviarCotizaciones(
  input: EnviarCotizacionesInput,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'No hay sesión activa.' }
  if (input.empresaIds.length === 0) return { ok: false, error: 'Elegí al menos un proveedor.' }

  const payload = await getPayloadClient()
  try {
    await Promise.all(
      input.empresaIds.map((empresaId) =>
        payload.create({
          collection: 'cotizaciones',
          data: {
            empresa: empresaId,
            solicitante: user.id,
            tipoConsulta: 'proyecto',
            estado: 'enviada',
            referencia: input.referencia || undefined,
            descripcion: input.descripcion,
            cantidad: input.cantidad || undefined,
            plazo: input.plazo || undefined,
            ubicacion: input.ubicacion || undefined,
            presupuesto: input.presupuesto || undefined,
            solicitanteNombre: user.nombreCompleto || user.email.split('@')[0],
            solicitanteEmail: user.email,
            solicitanteTelefono: user.telefono || undefined,
            solicitanteEmpresa: user.organizacion || undefined,
          },
          overrideAccess: false,
          user,
        }),
      ),
    )

    if (input.draftId) {
      await payload.delete({
        collection: 'proyecto-drafts',
        id: input.draftId,
        overrideAccess: false,
        user,
      })
    }

    return { ok: true }
  } catch {
    return { ok: false, error: 'No pudimos enviar las solicitudes.' }
  }
}
