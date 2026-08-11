import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/payload/media'
import {
  ListaCotizaciones,
  type CotizacionItem,
} from '@/components/cotizaciones/lista-cotizaciones'
import type { EstadoCotizacion } from '@/payload/collections/Cotizaciones'

export const metadata: Metadata = {
  title: 'Mis cotizaciones',
  robots: { index: false, follow: false },
}

export default async function MisCotizacionesPage() {
  const user = await requireUser('/mis-cotizaciones')

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'cotizaciones',
    where: { solicitante: { equals: user.id } },
    depth: 1,
    limit: 100,
    sort: '-createdAt',
  })

  const items: CotizacionItem[] = docs.map((c) => ({
    id: c.id,
    estado: c.estado as EstadoCotizacion,
    tipoConsulta: c.tipoConsulta,
    referencia: c.referencia ?? null,
    descripcion: c.descripcion,
    ubicacion: c.ubicacion ?? null,
    createdAt: c.createdAt,
    respuesta: c.respuesta ?? null,
    respondidaAt: c.respondidaAt ?? null,
    preferidaAt: c.preferidaAt ?? null,
    avanceConfirmadoAt: c.avanceConfirmadoAt ?? null,
    presupuestoMonto: c.presupuestoMonto ?? null,
    presupuestoMoneda: c.presupuestoMoneda ?? null,
    presupuestoValidezDias: c.presupuestoValidezDias ?? null,
    presupuestoPlazo: c.presupuestoPlazo ?? null,
    presupuestoArchivo: mediaUrl(c.presupuestoArchivo),
    empresa:
      typeof c.empresa === 'object' && c.empresa
        ? { nombre: c.empresa.nombre, slug: c.empresa.slug }
        : null,
  }))

  return (
    <div className="container-wide section">
      <p className="text-eyebrow mb-3 text-primary">Tu cuenta</p>
      <h1 className="mb-3 font-display text-4xl text-foreground md:text-5xl">Mis cotizaciones</h1>
      <p className="mb-10 max-w-2xl text-muted-foreground">
        Seguí el estado de las propuestas que pediste y compará antes de decidir.
      </p>
      <ListaCotizaciones items={items} />
    </div>
  )
}
