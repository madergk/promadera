export interface Provincia {
  nombre: string
  lat: number
  lon: number
}

/** Centroides oficiales (Georef, datos.gob.ar) */
export const PROVINCIAS_MAPA: Provincia[] = [
  { nombre: 'Jujuy', lat: -23.32, lon: -65.764 },
  { nombre: 'Salta', lat: -24.299, lon: -64.814 },
  { nombre: 'Formosa', lat: -24.895, lon: -59.932 },
  { nombre: 'Chaco', lat: -26.387, lon: -60.765 },
  { nombre: 'Misiones', lat: -26.875, lon: -54.652 },
  { nombre: 'Tucumán', lat: -26.948, lon: -65.365 },
  { nombre: 'Catamarca', lat: -27.336, lon: -66.948 },
  { nombre: 'Santiago del Estero', lat: -27.783, lon: -63.253 },
  { nombre: 'Corrientes', lat: -28.774, lon: -57.801 },
  { nombre: 'La Rioja', lat: -29.685, lon: -67.182 },
  { nombre: 'Santa Fe', lat: -30.709, lon: -60.951 },
  { nombre: 'San Juan', lat: -30.866, lon: -68.888 },
  { nombre: 'Córdoba', lat: -32.145, lon: -63.802 },
  { nombre: 'Entre Ríos', lat: -32.059, lon: -59.201 },
  { nombre: 'San Luis', lat: -33.761, lon: -66.025 },
  { nombre: 'Mendoza', lat: -34.63, lon: -68.583 },
  { nombre: 'Buenos Aires', lat: -36.677, lon: -60.558 },
  { nombre: 'CABA', lat: -34.614, lon: -58.446 },
  { nombre: 'La Pampa', lat: -37.135, lon: -65.448 },
  { nombre: 'Neuquén', lat: -38.642, lon: -70.12 },
  { nombre: 'Río Negro', lat: -40.405, lon: -67.23 },
  { nombre: 'Chubut', lat: -43.789, lon: -68.527 },
  { nombre: 'Santa Cruz', lat: -48.816, lon: -69.956 },
  { nombre: 'Tierra del Fuego', lat: -53.8, lon: -68.3 },
]

const normalizar = (v: string) =>
  v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

/** Detecta la provincia mencionada en un texto libre de ubicación. */
export function detectarProvincia(ubicacion: string | null | undefined): string | null {
  if (!ubicacion) return null
  const u = normalizar(ubicacion)
  if (/(caba|capital federal|ciudad autonoma)/.test(u)) return 'CABA'
  const match = PROVINCIAS_MAPA.find((p) => u.includes(normalizar(p.nombre)))
  return match?.nombre ?? null
}
