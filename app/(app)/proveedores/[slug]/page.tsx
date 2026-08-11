import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin } from 'lucide-react'

import {
  EmpresaDetalleBody,
  type EmpresaDetalleData,
  type ProductoCatalogo,
  type ServicioDetalle,
} from '@/components/empresas/empresa-detalle-body'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/payload/media'
import { safeJsonLd } from '@/lib/json-ld'
import type { Empresa } from '@/payload-types'

export const revalidate = 300

type Params = Promise<{ slug: string }>

async function getEmpresa(slug: string): Promise<Empresa | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'empresas',
    where: {
      and: [
        { slug: { equals: slug } },
        { publicada: { equals: true } },
        { estado: { equals: 'publicado' } },
      ],
    },
    limit: 1,
    depth: 1,
    // Aplica el access público: los campos sensibles no llegan ni al server component.
    overrideAccess: false,
  })
  return docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const empresa = await getEmpresa(slug)
  if (!empresa) return { title: 'Proveedor no encontrado' }
  return {
    title: empresa.nombre,
    description: empresa.descripcion ?? undefined,
  }
}

export default async function EmpresaDetallePage({ params }: { params: Params }) {
  const { slug } = await params
  const empresa = await getEmpresa(slug)
  if (!empresa) notFound()

  const data: EmpresaDetalleData = {
    id: empresa.id,
    nombre: empresa.nombre,
    descripcion: empresa.descripcion ?? null,
    servicios: (empresa.servicios ?? []).map((s) => s.servicio),
    serviciosDetalle: (empresa.serviciosDetalle ?? []).map(
      (s): ServicioDetalle => ({ titulo: s.servicio, descripcion: s.detalle ?? null }),
    ),
    productos: (empresa.productos ?? []).map(
      (p): ProductoCatalogo => ({
        nombre: p.nombre,
        descripcion: p.descripcion ?? null,
        imagen: mediaUrl(p.imagen),
      }),
    ),
    galeria: (empresa.galeria ?? [])
      .map((g) => mediaUrl(g))
      .filter((u): u is string => Boolean(u)),
    sitioWeb: empresa.sitioWeb ?? null,
    empleados: empresa.empleados ?? null,
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: empresa.nombre,
    description: empresa.descripcion ?? undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: empresa.ubicacion ?? undefined,
      addressRegion: 'Corrientes',
      addressCountry: 'AR',
    },
    ...(empresa.sitioWeb
      ? {
          url: empresa.sitioWeb.startsWith('http')
            ? empresa.sitioWeb
            : `https://${empresa.sitioWeb}`,
        }
      : {}),
    ...(empresa.anioFundacion ? { foundingDate: String(empresa.anioFundacion) } : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <div className="border-b border-border bg-gradient-warm pb-12 pt-12 md:pt-20">
        <div className="container-wide">
          <Link
            href="/proveedores"
            className="mb-10 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Volver al directorio
          </Link>
          <p className="text-eyebrow mb-5 text-primary">{empresa.sector}</p>
          <div className="flex items-start gap-6">
            <div className="grid h-20 w-20 shrink-0 place-items-center bg-primary font-display text-4xl text-primary-foreground md:h-28 md:w-28 md:text-5xl">
              {empresa.nombre[0]}
            </div>
            <div>
              <h1 className="text-balance font-display text-4xl leading-tight text-foreground md:text-5xl lg:text-6xl">
                {empresa.nombre}
              </h1>
              <p className="mt-4 flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {empresa.ubicacion}
                {empresa.anioFundacion && <span> · Desde {empresa.anioFundacion}</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      <EmpresaDetalleBody empresa={data} />
    </>
  )
}
