import type { Metadata } from 'next'

import { getCurrentUser } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/payload/media'
import { GuiaProyectoWizard, type RefProyecto } from '@/components/guia-proyecto/guia-proyecto-wizard'
import { buscarEmpresaPorId, listarBorradores } from './actions'

export const metadata: Metadata = {
  title: 'Guía de proyecto',
  description:
    'Armá tu proyecto en madera con un asistente y solicitá cotizaciones a proveedores del directorio.',
}

const EXTERIOR_CATEGORIAS = new Set(['Turismo', 'Comercial'])

async function getRefProyecto(slug: string | undefined): Promise<RefProyecto | null> {
  if (!slug) return null
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'proyectos',
    where: { and: [{ slug: { equals: slug } }, { publicado: { equals: true } }] },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  const p = docs[0]
  if (!p) return null
  return {
    slug: p.slug,
    titulo: p.titulo,
    categoria: p.categoria ?? null,
    ubicacion: p.ubicacion ?? null,
    anio: p.anio ?? null,
    sistemaConstructivo: p.sistemaConstructivo ?? null,
    materiales: (p.materiales ?? []).map((m) => m.material),
    imagen: mediaUrl(p.portada),
    tipoInferido: p.categoria && EXTERIOR_CATEGORIAS.has(p.categoria) ? 'exterior' : 'vivienda',
  }
}

export default async function GuiaProyectoPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; proyectoRef?: string; empresa?: string }>
}) {
  const sp = await searchParams
  const refSlug = sp.ref ?? sp.proyectoRef ?? null
  const empresaId = sp.empresa ? Number(sp.empresa) : null

  const [user, refProyecto, empresaPreseleccionada] = await Promise.all([
    getCurrentUser(),
    getRefProyecto(refSlug ?? undefined),
    empresaId && Number.isFinite(empresaId) ? buscarEmpresaPorId(empresaId) : Promise.resolve(null),
  ])
  const drafts = user ? await listarBorradores() : []

  return (
    <div className="container-prose section max-w-4xl">
      <header className="mb-10">
        <p className="text-eyebrow mb-3 text-primary">Para particulares</p>
        <h1 className="mb-3 text-4xl md:text-5xl">Guía de proyecto</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Contanos cómo imaginás tu obra y nuestro asistente te ayuda a armar un brief claro para
          enviar a los proveedores del directorio.
        </p>
      </header>

      <GuiaProyectoWizard
        refSlug={refSlug}
        refProyecto={refProyecto}
        draftsIniciales={drafts}
        loggedIn={Boolean(user)}
        empresaPreseleccionada={empresaPreseleccionada}
      />
    </div>
  )
}
