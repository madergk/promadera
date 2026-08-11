import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, ExternalLink, Inbox } from 'lucide-react'

import { requireUser } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { Button } from '@/components/ui/button'
import { EstadoBadge } from '@/components/cotizaciones/estado-badge'
import { estadoEmpresaMeta } from '@/lib/empresa-estado'
import { cn } from '@/lib/utils'
import type { EstadoCotizacion } from '@/payload/collections/Cotizaciones'

export const metadata: Metadata = {
  title: 'Panel del proveedor',
  description: 'Recibí y respondé las solicitudes de cotización dirigidas a tu empresa.',
  robots: { index: false, follow: false },
}

export default async function PanelProveedorPage() {
  const user = await requireUser('/panel-proveedor')

  const payload = await getPayloadClient()
  const { docs: empresas } = await payload.find({
    collection: 'empresas',
    where: { user: { equals: user.id } },
    sort: 'nombre',
    depth: 0,
    limit: 50,
  })

  if (empresas.length === 0) {
    return (
      <div className="container-prose section max-w-3xl">
        <Header />
        <div className="border border-dashed border-border p-10 text-center">
          <Building2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h2 className="mb-2 font-display text-xl">Todavía no tenés una empresa en el directorio</h2>
          <p className="mx-auto mb-6 max-w-md text-muted-foreground">
            Para recibir y responder solicitudes de cotización primero tenés que publicar tu
            empresa como proveedor del ecosistema.
          </p>
          <Button asChild>
            <Link href="/proveedores/alta">Sumar mi empresa</Link>
          </Button>
        </div>
      </div>
    )
  }

  const empresaIds = empresas.map((e) => e.id)
  const { docs: cotizaciones } = await payload.find({
    collection: 'cotizaciones',
    where: { empresa: { in: empresaIds } },
    sort: '-createdAt',
    depth: 1,
    limit: 200,
  })

  const counts = {
    total: cotizaciones.length,
    pendientes: cotizaciones.filter((c) => c.estado === 'enviada' || c.estado === 'en_revision').length,
    respondidas: cotizaciones.filter((c) => c.estado === 'respondida').length,
  }

  return (
    <div className="container-prose section max-w-6xl">
      <Header />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <StatCard label="Total recibidas" value={counts.total} />
        <StatCard label="Pendientes de responder" value={counts.pendientes} accent />
        <StatCard label="Respondidas" value={counts.respondidas} />
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-sm uppercase tracking-[0.18em] text-muted-foreground">
          Empresas que administrás
        </h2>
        <div className="grid gap-2">
          {empresas.map((e) => {
            const meta = estadoEmpresaMeta(e.estado)
            return (
              <div key={e.id} className="border border-border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Building2 className="h-3.5 w-3.5" />
                  <span className="text-sm font-medium">{e.nombre}</span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]',
                      meta.badge,
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
                    {meta.label}
                  </span>
                  {e.estado === 'publicado' && (
                    <Link
                      href={`/proveedores/${e.slug}`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Ver perfil <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{meta.publico}</p>
              </div>
            )
          })}
        </div>
      </div>

      {cotizaciones.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center">
          <Inbox className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            Todavía no recibiste solicitudes. Cuando un usuario te envíe un pedido, aparecerá acá.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {cotizaciones.map((c) => {
            const empresa = typeof c.empresa === 'object' ? c.empresa : null
            return (
              <Link
                key={c.id}
                href={`/panel-proveedor/${c.id}`}
                className="border border-border p-5 text-left transition-colors hover:bg-muted/30"
              >
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {empresa?.nombre ?? 'Empresa'} · {c.tipoConsulta}
                    </div>
                    <div className="font-display text-lg">{c.referencia || 'Solicitud sin título'}</div>
                  </div>
                  <EstadoBadge estado={c.estado as EstadoCotizacion} />
                </div>
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{c.descripcion}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>De: {c.solicitanteNombre ?? '—'}</span>
                  {c.ubicacion && <span>· {c.ubicacion}</span>}
                  {c.cantidad && <span>· {c.cantidad}</span>}
                  <span className="ml-auto">
                    {new Date(c.createdAt).toLocaleDateString('es-AR')}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Header() {
  return (
    <header className="mb-10">
      <p className="text-eyebrow mb-3 text-primary">Panel del proveedor</p>
      <h1 className="mb-3 text-4xl md:text-5xl">Solicitudes de cotización</h1>
      <p className="max-w-2xl text-lg text-muted-foreground">
        Acá llegan los pedidos que los particulares y profesionales envían a las empresas que
        administrás en el directorio.
      </p>
    </header>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={cn('border p-5', accent ? 'border-primary/40 bg-primary/5' : 'border-border')}>
      <div className="mb-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="font-display text-3xl">{value}</div>
    </div>
  )
}
