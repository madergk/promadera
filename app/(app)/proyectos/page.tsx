import type { Metadata } from 'next'

import { PageHeader } from '@/components/shared/page-header'
import { ListadoProyectos, type ProyectoCard } from '@/components/proyectos/listado'
import { getPayloadClient } from '@/lib/payload'
import { firstMediaUrl, mediaUrl } from '@/lib/payload/media'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Proyectos',
  description:
    'Obras de construcción en madera de la red Promadera: vivienda, turismo, industria e instituciones.',
}

async function getProyectos(): Promise<ProyectoCard[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'proyectos',
    where: { publicado: { equals: true } },
    limit: 200,
    depth: 1,
    sort: '-anio',
    overrideAccess: false,
  })

  return docs.map((p) => ({
    slug: p.slug,
    titulo: p.titulo,
    resumen: p.resumen ?? null,
    categoria: p.categoria ?? null,
    ubicacion: p.ubicacion ?? null,
    anio: p.anio ?? null,
    imagen: mediaUrl(p.portada) ?? firstMediaUrl(p.galeria),
    sistemaConstructivo: p.sistemaConstructivo ?? null,
    constructora: p.constructora ?? null,
  }))
}

export default async function ProyectosPage() {
  const proyectos = await getProyectos()

  return (
    <>
      <PageHeader
        eyebrow="Obras de la red"
        title="Casas de madera, ya construidas."
        description="Metros, sistema constructivo y quién las hizo. Filtrá y encontrá tu referencia."
        image="/assets/hero-casa-madera.jpg"
        imageAlt="Casa de madera moderna terminada, vista exterior"
        priority
      />
      <ListadoProyectos proyectos={proyectos} />
    </>
  )
}
