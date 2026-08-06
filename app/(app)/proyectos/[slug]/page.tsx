import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Building, Calendar, Hammer, Leaf, MapPin, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getPayloadClient } from '@/lib/payload'
import { firstMediaUrl, mediaUrl } from '@/lib/payload/media'
import type { Proyecto } from '@/payload-types'

export const revalidate = 300

const FALLBACK_COVER = '/assets/wood-architecture.jpg'

type Params = Promise<{ slug: string }>

async function getProyecto(slug: string): Promise<Proyecto | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'proyectos',
    where: { and: [{ slug: { equals: slug } }, { publicado: { equals: true } }] },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const proyecto = await getProyecto(slug)
  if (!proyecto) return { title: 'Proyecto no encontrado' }
  return {
    title: proyecto.titulo,
    description: proyecto.resumen ?? undefined,
    openGraph: { type: 'article' },
  }
}

export default async function ProyectoDetallePage({ params }: { params: Params }) {
  const { slug } = await params
  const proyecto = await getProyecto(slug)
  if (!proyecto) notFound()

  const portada = mediaUrl(proyecto.portada) ?? firstMediaUrl(proyecto.galeria) ?? FALLBACK_COVER
  const galeria = (proyecto.galeria ?? [])
    .map((g) => mediaUrl(g))
    .filter((u): u is string => Boolean(u))
  const materiales = (proyecto.materiales ?? []).map((m) => m.material)
  const empresas = (proyecto.empresas ?? [])
    .map((e) => (typeof e === 'object' ? e.nombre : null))
    .filter((n): n is string => Boolean(n))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    headline: proyecto.titulo,
    name: proyecto.titulo,
    description: proyecto.resumen ?? undefined,
    ...(portada !== FALLBACK_COVER ? { image: portada } : {}),
    ...(proyecto.anio ? { dateCreated: String(proyecto.anio) } : {}),
    ...(proyecto.ubicacion
      ? { locationCreated: { '@type': 'Place', name: proyecto.ubicacion } }
      : {}),
    creator: [
      ...(proyecto.arquitecto ? [{ '@type': 'Organization', name: proyecto.arquitecto }] : []),
      ...(proyecto.constructora ? [{ '@type': 'Organization', name: proyecto.constructora }] : []),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <div className="relative border-b border-border bg-gradient-warm pb-12 pt-12 md:pt-20">
          <div className="container-wide">
            <Link
              href="/proyectos"
              className="mb-10 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" />
              Volver a proyectos
            </Link>
            <p className="text-eyebrow mb-5 text-primary">
              {proyecto.categoria}
              {proyecto.anio && ` · ${proyecto.anio}`}
            </p>
            <h1 className="max-w-4xl text-balance font-display text-4xl leading-[1.02] text-foreground md:text-6xl lg:text-7xl">
              {proyecto.titulo}
            </h1>
            {proyecto.resumen && (
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {proyecto.resumen}
              </p>
            )}
          </div>
        </div>

        <div className="container-wide section grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={portada}
                alt={proyecto.titulo}
                fill
                priority
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover"
              />
            </div>
            {proyecto.descripcion && (
              <div className="mt-12">
                <p className="text-base leading-relaxed text-foreground/90 md:text-lg">
                  {proyecto.descripcion}
                </p>
              </div>
            )}
            {galeria.length > 0 && (
              <div className="mt-12 grid gap-4 sm:grid-cols-2">
                {galeria.map((g, i) => (
                  <div key={i} className="relative aspect-[4/3] w-full">
                    <Image
                      src={g}
                      alt={`${proyecto.titulo} ${i + 1}`}
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-8 self-start lg:sticky lg:top-32 lg:col-span-4">
            <div className="border border-border p-6">
              <h3 className="mb-5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Ficha técnica
              </h3>
              <dl className="space-y-4 text-sm">
                {proyecto.ubicacion && (
                  <div>
                    <dt className="mb-1 flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      Ubicación
                    </dt>
                    <dd className="font-medium text-foreground">{proyecto.ubicacion}</dd>
                  </div>
                )}
                {proyecto.anio && (
                  <div>
                    <dt className="mb-1 flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Año
                    </dt>
                    <dd className="font-medium text-foreground">{proyecto.anio}</dd>
                  </div>
                )}
                {proyecto.arquitecto && (
                  <div>
                    <dt className="mb-1 flex items-center gap-2 text-muted-foreground">
                      <Building className="h-3 w-3" />
                      Arquitecto
                    </dt>
                    <dd className="font-medium text-foreground">{proyecto.arquitecto}</dd>
                  </div>
                )}
                {proyecto.constructora && (
                  <div>
                    <dt className="mb-1 flex items-center gap-2 text-muted-foreground">
                      <Hammer className="h-3 w-3" />
                      Constructor
                    </dt>
                    <dd className="font-medium text-foreground">{proyecto.constructora}</dd>
                  </div>
                )}
                {proyecto.sistemaConstructivo && (
                  <div>
                    <dt className="mb-1 text-muted-foreground">Sistema</dt>
                    <dd className="font-medium text-foreground">{proyecto.sistemaConstructivo}</dd>
                  </div>
                )}
                {materiales.length > 0 && (
                  <div>
                    <dt className="mb-1 text-muted-foreground">Materiales</dt>
                    <dd className="font-medium text-foreground">{materiales.join(', ')}</dd>
                  </div>
                )}
                {empresas.length > 0 && (
                  <div>
                    <dt className="mb-1 text-muted-foreground">Empresas</dt>
                    <dd className="font-medium text-foreground">{empresas.join(', ')}</dd>
                  </div>
                )}
              </dl>
            </div>

            {proyecto.impactoCarbono && (
              <div className="border border-border bg-muted/40 p-6">
                <Leaf className="mb-3 h-5 w-5 text-accent" />
                <h3 className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Impacto ambiental
                </h3>
                <p className="font-display text-3xl leading-tight text-primary">
                  {proyecto.impactoCarbono}
                </p>
              </div>
            )}

            <Button asChild variant="default" className="w-full">
              <Link href="/contacto">Solicitar información</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/guia-proyecto?ref=${proyecto.slug}`}>
                <Sparkles className="mr-2 h-4 w-4" />
                Crear proyecto similar con IA
              </Link>
            </Button>
          </aside>
        </div>
      </article>
    </>
  )
}
