'use server'

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { toPayloadFile } from '@/lib/payload/upload-file'
import { mediaUrl } from '@/lib/payload/media'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_IMAGE_MB = 5
const MAX_PDF_MB = 15

export type UploadResult = { ok: true; id: number; url: string; nombre: string } | { ok: false; error: string }

export async function subirImagen(formData: FormData): Promise<UploadResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Sesión expirada.' }

  const file = formData.get('file')
  if (!(file instanceof File)) return { ok: false, error: 'Archivo inválido.' }
  if (!IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: 'Formato no soportado (JPG, PNG, WebP o AVIF).' }
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return { ok: false, error: `El archivo no puede superar ${MAX_IMAGE_MB} MB.` }
  }

  try {
    const payload = await getPayloadClient()
    const doc = await payload.create({
      collection: 'media',
      data: { alt: file.name },
      file: await toPayloadFile(file),
      user,
    })
    const url = mediaUrl(doc)
    if (!url) return { ok: false, error: 'No pudimos subir la imagen.' }
    return { ok: true, id: doc.id, url, nombre: file.name }
  } catch {
    return { ok: false, error: 'No pudimos subir la imagen.' }
  }
}

export async function eliminarImagen(id: number): Promise<{ ok: boolean }> {
  const user = await getCurrentUser()
  if (!user) return { ok: false }
  try {
    const payload = await getPayloadClient()
    await payload.delete({ collection: 'media', id, user })
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

export async function subirDocumento(formData: FormData): Promise<UploadResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Sesión expirada.' }

  const file = formData.get('file')
  if (!(file instanceof File)) return { ok: false, error: 'Archivo inválido.' }
  if (file.type !== 'application/pdf') return { ok: false, error: 'El documento debe ser un PDF.' }
  if (file.size > MAX_PDF_MB * 1024 * 1024) {
    return { ok: false, error: `El archivo no puede superar ${MAX_PDF_MB} MB.` }
  }

  try {
    const payload = await getPayloadClient()
    const doc = await payload.create({
      collection: 'documentos',
      data: { nombre: file.name },
      file: await toPayloadFile(file),
      user,
      overrideAccess: false,
    })
    return { ok: true, id: doc.id, url: '', nombre: file.name }
  } catch {
    return { ok: false, error: 'No pudimos subir el documento.' }
  }
}

export async function eliminarDocumento(id: number): Promise<{ ok: boolean }> {
  const user = await getCurrentUser()
  if (!user) return { ok: false }
  try {
    const payload = await getPayloadClient()
    await payload.delete({ collection: 'documentos', id, user, overrideAccess: false })
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

export type AltaState = { error?: string }

const CONSENT_VERSION = '2026-08'

async function buildUniqueSlug(payload: Awaited<ReturnType<typeof getPayloadClient>>, base: string) {
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 60)

  const root = slugify(base) || 'proveedor'
  for (let i = 0; i < 8; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`
    const existing = await payload.find({
      collection: 'empresas',
      where: { slug: { equals: candidate } },
      limit: 1,
      depth: 0,
    })
    if (existing.totalDocs === 0) return candidate
  }
  return `${root}-${Date.now().toString(36)}`
}

export async function crearEmpresa(_prev: AltaState, formData: FormData): Promise<AltaState> {
  const user = await getCurrentUser()
  if (!user) redirect('/auth?next=%2Fproveedores%2Falta')

  const nombre = String(formData.get('nombre') ?? '').trim()
  const sector = String(formData.get('sector') ?? '').trim()
  const descripcion = String(formData.get('descripcion') ?? '').trim()
  const tipoProveedor = String(formData.get('tipoProveedor') ?? '')
  const ubicacion = String(formData.get('ubicacion') ?? '').trim()
  const telefono = String(formData.get('telefono') ?? '').trim()
  const whatsapp = String(formData.get('whatsapp') ?? '').trim()
  const sitioWeb = String(formData.get('sitioWeb') ?? '').trim()
  const servicios = formData.getAll('servicios').map(String).filter(Boolean)
  const productos = formData.getAll('productos').map(String).filter(Boolean)
  const logoId = formData.get('logoId') ? Number(formData.get('logoId')) : null
  const galeriaIds = formData.getAll('galeriaIds').map(Number).filter((n) => !Number.isNaN(n))
  const documentoIds = formData.getAll('documentoIds').map(Number).filter((n) => !Number.isNaN(n))
  const consentTerminos = formData.get('consentTerminos') === 'on'
  const consentDatos = formData.get('consentDatos') === 'on'
  const consentVeracidad = formData.get('consentVeracidad') === 'on'
  const consentComunicaciones = formData.get('consentComunicaciones') === 'on'

  if (nombre.length < 2) return { error: 'Ingresá el nombre de la empresa.' }
  if (descripcion.length < 20) return { error: 'La descripción debe tener al menos 20 caracteres.' }
  if (servicios.length === 0 && productos.length === 0) {
    return { error: 'Sumá al menos un servicio o producto.' }
  }
  if (!ubicacion) return { error: 'Ingresá la ubicación.' }
  if (!telefono && !whatsapp) return { error: 'Indicá un teléfono o WhatsApp de contacto.' }
  if (!consentTerminos || !consentDatos || !consentVeracidad) {
    return { error: 'Necesitamos que aceptes los términos y el tratamiento de datos.' }
  }

  try {
    const payload = await getPayloadClient()
    const slug = await buildUniqueSlug(payload, nombre)

    await payload.create({
      collection: 'empresas',
      data: {
        user: user.id,
        slug,
        nombre,
        sector,
        descripcion,
        ubicacion,
        servicios: servicios.map((servicio) => ({ servicio })),
        productos: productos.map((p) => ({ nombre: p })),
        sitioWeb: sitioWeb || undefined,
        telefono: telefono || undefined,
        whatsapp: whatsapp || undefined,
        contacto: telefono || whatsapp || undefined,
        tipoProveedor: tipoProveedor as 'empresa' | 'productor' | 'industrial' | 'profesional',
        logo: logoId ?? undefined,
        galeria: galeriaIds.length ? galeriaIds : undefined,
        documentos: documentoIds.length ? documentoIds : undefined,
        estado: 'en_revision',
        publicada: false,
        consentimientos: {
          terminosAceptados: consentTerminos && consentDatos && consentVeracidad,
          comunicacionesAceptadas: consentComunicaciones,
          version: CONSENT_VERSION,
          fechaConsentimiento: new Date().toISOString(),
        },
      },
      user,
      overrideAccess: false,
    })

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        profileType: tipoProveedor === 'productor' ? 'productor' : 'empresa',
        organizacion: nombre,
        onboarded: true,
      },
    })
  } catch {
    return { error: 'No pudimos crear tu ficha. Intentá de nuevo.' }
  }

  redirect('/panel-proveedor')
}
