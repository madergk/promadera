'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FileText, Globe, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CotizacionWizard } from '@/components/empresas/cotizacion-wizard'

export interface ServicioDetalle {
  titulo: string
  descripcion?: string | null
  precio?: string | null
}
export interface ProductoCatalogo {
  nombre: string
  descripcion?: string | null
  categoria?: string | null
  imagen?: string | null
}

export interface EmpresaDetalleData {
  id: number
  nombre: string
  descripcion: string | null
  servicios: string[]
  serviciosDetalle: ServicioDetalle[]
  productos: ProductoCatalogo[]
  galeria: string[]
  sitioWeb: string | null
  empleados: string | null
}

type WizardInit = { tipo?: 'producto' | 'servicio' | 'proyecto'; referencia?: string }

export function EmpresaDetalleBody({ empresa }: { empresa: EmpresaDetalleData }) {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardInit, setWizardInit] = useState<WizardInit>({})

  const openWizard = (init: WizardInit = {}) => {
    setWizardInit(init)
    setWizardOpen(true)
  }

  const hasServiciosDetalle = empresa.serviciosDetalle.length > 0
  const hasProductos = empresa.productos.length > 0
  const hasGaleria = empresa.galeria.length > 0

  return (
    <section className="container-wide section grid gap-12 lg:grid-cols-12">
      <div className="space-y-16 lg:col-span-8">
        {empresa.descripcion && (
          <p className="text-lg leading-relaxed text-foreground/90">{empresa.descripcion}</p>
        )}

        <div>
          <h2 className="mb-6 font-display text-2xl md:text-3xl">Servicios</h2>
          {hasServiciosDetalle ? (
            <div className="space-y-px border border-border bg-border">
              {empresa.serviciosDetalle.map((s) => (
                <div
                  key={s.titulo}
                  className="flex flex-col gap-4 bg-background p-6 sm:flex-row sm:items-start"
                >
                  <div className="flex-1">
                    <h3 className="mb-1 font-display text-lg">{s.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{s.descripcion}</p>
                    {s.precio && (
                      <p className="mt-2 text-xs uppercase tracking-[0.14em] text-primary">
                        {s.precio}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openWizard({ tipo: 'servicio', referencia: s.titulo })}
                    className="shrink-0"
                  >
                    Cotizar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
              {empresa.servicios.map((s) => (
                <div key={s} className="bg-background p-5 text-sm">
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {hasProductos && (
          <div>
            <h2 className="mb-6 font-display text-2xl md:text-3xl">Catálogo</h2>
            <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
              {empresa.productos.map((p) => (
                <div key={p.nombre} className="flex flex-col bg-background">
                  {p.imagen ? (
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <Image
                        src={p.imagen}
                        alt={p.nombre}
                        fill
                        sizes="(min-width: 640px) 33vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center bg-muted/40 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {p.categoria ?? 'Producto'}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    {p.categoria && <p className="text-eyebrow text-primary">{p.categoria}</p>}
                    <h3 className="font-display text-lg">{p.nombre}</h3>
                    <p className="flex-1 text-sm text-muted-foreground">{p.descripcion}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openWizard({ tipo: 'producto', referencia: p.nombre })}
                      className="mt-2 self-start"
                    >
                      Cotizar este producto
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasGaleria && (
          <div>
            <h2 className="mb-6 font-display text-2xl md:text-3xl">Obras y portafolio</h2>
            <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-3">
              {empresa.galeria.map((url, i) => (
                <div key={i} className="relative aspect-square overflow-hidden bg-background">
                  <Image
                    src={url}
                    alt={`Obra ${i + 1}`}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-4 self-start lg:sticky lg:top-32 lg:col-span-4">
        <Button onClick={() => openWizard()} className="w-full" size="lg">
          <FileText className="h-4 w-4" /> Solicitar cotización
        </Button>
        {(empresa.sitioWeb || empresa.empleados) && (
          <div className="space-y-4 border border-border p-6 text-sm">
            {empresa.sitioWeb && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 shrink-0 text-accent" />
                <a
                  href={`https://${empresa.sitioWeb.replace(/^https?:\/\//, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline break-all"
                >
                  {empresa.sitioWeb}
                </a>
              </div>
            )}
            {empresa.empleados && (
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 shrink-0 text-accent" />
                <span>{empresa.empleados} colaboradores</span>
              </div>
            )}
          </div>
        )}
      </aside>

      <CotizacionWizard
        // remonta el wizard cuando cambia la precarga: su estado inicial se fija al montar
        key={`${wizardInit.tipo ?? ''}|${wizardInit.referencia ?? ''}`}
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        empresaId={empresa.id}
        empresaNombre={empresa.nombre}
        productos={empresa.productos}
        servicios={empresa.serviciosDetalle}
        initialTipo={wizardInit.tipo}
        initialReferencia={wizardInit.referencia}
      />
    </section>
  )
}
