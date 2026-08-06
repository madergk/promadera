import type { Metadata } from 'next'

import { PageHeader } from '@/components/shared/page-header'
import { DirectorioProveedores, type EmpresaCard } from '@/components/proveedores/directorio'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Proveedores',
  description:
    'Directorio de constructoras, fabricantes y proveedores de la red Promadera. Filtrá por sector y ubicación, y pedí tu cotización.',
}

async function getEmpresas(): Promise<EmpresaCard[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'empresas',
    where: { and: [{ publicada: { equals: true } }, { estado: { equals: 'publicado' } }] },
    limit: 500,
    depth: 0,
    sort: 'nombre',
    // Local API sin usuario: aplica el access público (columna sensible fuera).
    overrideAccess: false,
  })

  return docs.map((e) => ({
    slug: e.slug,
    nombre: e.nombre,
    sector: e.sector ?? null,
    descripcion: e.descripcion ?? null,
    ubicacion: e.ubicacion ?? null,
    servicios: (e.servicios ?? []).map((s) => s.servicio),
  }))
}

export default async function ProveedoresPage() {
  const empresas = await getEmpresas()

  return (
    <>
      <PageHeader
        eyebrow="Directorio de la red"
        title="Proveedores certificados."
        description="Constructoras, fabricantes y servicios que trabajan en madera. Filtrá por sector y zona, y pedí tu cotización."
        image="/assets/hero-constructoras.jpg"
        imageAlt="Equipo de constructores trabajando sobre una estructura de madera"
        priority
      />
      <DirectorioProveedores empresas={empresas} />
    </>
  )
}
