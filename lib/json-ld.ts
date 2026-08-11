/**
 * JSON.stringify no escapa '<', así que un valor con "</script>" dentro de un
 * campo controlado por el usuario (ej. empresa.descripcion) cierra el <script
 * type="application/ld+json"> antes de tiempo y abre HTML/script arbitrario.
 * Escapar '<' a < mantiene el JSON válido y rompe ese breakout.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
