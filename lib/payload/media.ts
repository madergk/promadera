import type { Media } from '@/payload-types'

type MaybeMedia = number | Media | null | undefined

/** URL de un campo upload de Payload, resuelto o no (devuelve null si no hay). */
export function mediaUrl(value: MaybeMedia): string | null {
  if (!value || typeof value === 'number') return null
  return value.url ?? null
}

/** Texto alternativo de un campo upload, con fallback. */
export function mediaAlt(value: MaybeMedia, fallback = ''): string {
  if (!value || typeof value === 'number') return fallback
  return value.alt ?? fallback
}

/** Primera imagen de una galería (campo upload hasMany). */
export function firstMediaUrl(value: MaybeMedia[] | null | undefined): string | null {
  if (!Array.isArray(value)) return null
  for (const item of value) {
    const url = mediaUrl(item)
    if (url) return url
  }
  return null
}
