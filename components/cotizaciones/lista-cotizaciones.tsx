'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { CalendarClock, ChevronDown, FileText, Mail, MapPin, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EstadoBadge, estadoMeta } from '@/components/cotizaciones/estado-badge'
import { cn } from '@/lib/utils'
import type { EstadoCotizacion } from '@/payload/collections/Cotizaciones'
import { cancelarCotizacion, confirmarAvance, marcarPreferida } from '@/app/(app)/mis-cotizaciones/actions'

export interface CotizacionItem {
  id: number
  estado: EstadoCotizacion
  tipoConsulta: string
  referencia: string | null
  descripcion: string
  ubicacion: string | null
  createdAt: string
  respuesta: string | null
  respondidaAt: string | null
  preferidaAt: string | null
  avanceConfirmadoAt: string | null
  presupuestoMonto: number | null
  presupuestoMoneda: string | null
  presupuestoValidezDias: number | null
  presupuestoPlazo: string | null
  presupuestoArchivo: string | null
  empresa: { nombre: string; slug: string } | null
}

const fecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : null

export function ListaCotizaciones({ items }: { items: CotizacionItem[] }) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [pending, startTransition] = useTransition()

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) =>
    startTransition(async () => {
      const res = await fn()
      if (res.ok) toast.success(okMsg)
      else toast.error(res.error ?? 'No pudimos completar la acción.')
    })

  if (items.length === 0) {
    return (
      <div className="border border-border bg-muted/30 p-10 text-center">
        <FileText className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
        <h2 className="mt-5 font-display text-2xl">Todavía no pediste cotizaciones</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Buscá un proveedor en el directorio y pedile una propuesta. Vas a poder seguir el estado
          acá.
        </p>
        <Button asChild className="mt-8">
          <Link href="/proveedores">Ver proveedores</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-px bg-border">
      {items.map((c) => {
        const abierto = expanded === c.id
        const cancelable = c.estado === 'enviada' || c.estado === 'en_revision'
        return (
          <article key={c.id} className="bg-background p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <EstadoBadge estado={c.estado} />
                  {c.preferidaAt && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-primary">
                      <Star className="h-3 w-3 fill-current" /> Preferida
                    </span>
                  )}
                </div>
                <h2 className="font-display text-xl text-foreground md:text-2xl">
                  {c.empresa ? (
                    <Link href={`/proveedores/${c.empresa.slug}`} className="hover:text-accent">
                      {c.empresa.nombre}
                    </Link>
                  ) : (
                    'Proveedor'
                  )}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {c.referencia ? `${c.referencia} · ` : ''}
                  {c.tipoConsulta}
                </p>
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock className="h-3 w-3" />
                    Enviada el {fecha(c.createdAt)}
                  </span>
                  {c.ubicacion && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      {c.ubicacion}
                    </span>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setExpanded(abierto ? null : c.id)}
                aria-expanded={abierto}
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {abierto ? 'Ocultar' : 'Ver detalle'}
                <ChevronDown className={cn('h-4 w-4 transition-transform', abierto && 'rotate-180')} />
              </button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">{estadoMeta(c.estado).description}</p>

            {abierto && (
              <div className="mt-6 space-y-6 border-t border-border pt-6">
                <div>
                  <p className="text-eyebrow mb-2 text-muted-foreground">Tu consulta</p>
                  <p className="whitespace-pre-line text-sm text-foreground/90">{c.descripcion}</p>
                </div>

                {c.respuesta && (
                  <div className="border-l-2 border-success/50 pl-4">
                    <p className="text-eyebrow mb-2 inline-flex items-center gap-1.5 text-success">
                      <Mail className="h-3 w-3" />
                      Respuesta {c.respondidaAt && `· ${fecha(c.respondidaAt)}`}
                    </p>
                    <p className="whitespace-pre-line text-sm text-foreground/90">{c.respuesta}</p>
                  </div>
                )}

                {c.presupuestoMonto != null && (
                  <div className="border border-border p-5">
                    <p className="text-eyebrow mb-3 text-muted-foreground">Presupuesto</p>
                    <p className="font-display text-3xl text-foreground">
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: c.presupuestoMoneda ?? 'ARS',
                        maximumFractionDigits: 0,
                      }).format(c.presupuestoMonto)}
                    </p>
                    <dl className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                      {c.presupuestoPlazo && (
                        <div>
                          <dt className="inline">Plazo: </dt>
                          <dd className="inline text-foreground">{c.presupuestoPlazo}</dd>
                        </div>
                      )}
                      {c.presupuestoValidezDias && (
                        <div>
                          <dt className="inline">Validez: </dt>
                          <dd className="inline text-foreground">
                            {c.presupuestoValidezDias} días
                          </dd>
                        </div>
                      )}
                    </dl>
                    {c.presupuestoArchivo && (
                      <Button asChild variant="outline" size="sm" className="mt-5">
                        <a href={c.presupuestoArchivo} target="_blank" rel="noreferrer">
                          <FileText className="h-4 w-4" /> Ver presupuesto
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                {c.avanceConfirmadoAt && (
                  <p className="text-xs text-success">
                    Confirmaste avanzar con esta propuesta el {fecha(c.avanceConfirmadoAt)}.
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  {c.estado === 'respondida' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() =>
                          run(
                            () => marcarPreferida(c.id),
                            c.preferidaAt ? 'Quitada de preferidas' : 'Marcada como preferida',
                          )
                        }
                      >
                        <Star className={cn('h-4 w-4', c.preferidaAt && 'fill-current')} />
                        {c.preferidaAt ? 'Quitar preferida' : 'Marcar preferida'}
                      </Button>
                      {!c.avanceConfirmadoAt && (
                        <Button
                          size="sm"
                          disabled={pending}
                          onClick={() =>
                            run(() => confirmarAvance(c.id), 'Le avisamos al proveedor.')
                          }
                        >
                          Confirmar avance
                        </Button>
                      )}
                    </>
                  )}
                  {cancelable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() => run(() => cancelarCotizacion(c.id), 'Solicitud cancelada')}
                    >
                      Cancelar solicitud
                    </Button>
                  )}
                </div>
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}
