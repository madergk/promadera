import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { requireUser } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/payload/media'
import { listarHilo } from '@/components/cotizaciones/hilo-actions'
import { DetalleCotizacionProveedor } from '@/components/panel-proveedor/detalle-cotizacion'

export const metadata: Metadata = {
  title: 'Solicitud de cotización',
  robots: { index: false, follow: false },
}

type Params = Promise<{ id: string }>

export default async function PanelProveedorDetallePage({ params }: { params: Params }) {
  const { id } = await params
  const cotizacionId = Number(id)
  if (Number.isNaN(cotizacionId)) notFound()

  const user = await requireUser(`/panel-proveedor/${id}`)

  const payload = await getPayloadClient()
  const cot = await payload
    .findByID({ collection: 'cotizaciones', id: cotizacionId, depth: 1 })
    .catch(() => null)
  if (!cot) notFound()

  const empresa = typeof cot.empresa === 'object' ? cot.empresa : null
  const empresaOwnerId = typeof empresa?.user === 'object' ? empresa?.user?.id : empresa?.user
  if (empresaOwnerId !== user.id) notFound()

  const archivo = typeof cot.presupuestoArchivo === 'object' ? cot.presupuestoArchivo : null
  const hilo = await listarHilo(cotizacionId)

  return (
    <DetalleCotizacionProveedor
      cot={{
        id: cot.id,
        empresaNombre: empresa?.nombre ?? 'Empresa',
        tipoConsulta: cot.tipoConsulta,
        referencia: cot.referencia ?? null,
        descripcion: cot.descripcion,
        cantidad: cot.cantidad ?? null,
        plazo: cot.plazo ?? null,
        ubicacion: cot.ubicacion ?? null,
        presupuestoCliente: cot.presupuesto ?? null,
        estado: cot.estado,
        createdAt: cot.createdAt,
        presupuestoMonto: cot.presupuestoMonto ?? null,
        presupuestoMoneda: cot.presupuestoMoneda ?? 'ARS',
        presupuestoValidezDias: cot.presupuestoValidezDias ?? null,
        presupuestoPlazo: cot.presupuestoPlazo ?? null,
        respuesta: cot.respuesta ?? null,
        archivo: archivo ? { id: archivo.id, nombre: archivo.nombre, url: mediaUrl(archivo) } : null,
        solicitanteNombre: cot.solicitanteNombre ?? null,
        solicitanteEmpresa: cot.solicitanteEmpresa ?? null,
        solicitanteEmail: cot.solicitanteEmail ?? null,
        solicitanteTelefono: cot.solicitanteTelefono ?? null,
      }}
      hiloInicial={hilo}
    />
  )
}
