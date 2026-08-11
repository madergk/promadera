import { cn } from '@/lib/utils'
import { ESTADOS_COTIZACION, type EstadoCotizacion } from '@/payload/collections/Cotizaciones'

const CLASSNAME: Record<EstadoCotizacion, string> = {
  enviada: 'border-warning/40 bg-warning/10 text-warning',
  en_revision: 'border-info/40 bg-info/10 text-info',
  respondida: 'border-success/40 bg-success/10 text-success',
  cerrada: 'border-border bg-muted text-muted-foreground',
  cancelada: 'border-destructive/40 bg-destructive/10 text-destructive',
}

export const estadoMeta = (estado: EstadoCotizacion) =>
  ESTADOS_COTIZACION.find((e) => e.value === estado) ?? ESTADOS_COTIZACION[0]

export function EstadoBadge({ estado }: { estado: EstadoCotizacion }) {
  return (
    <span
      className={cn(
        'inline-flex border px-2.5 py-1 text-xs uppercase tracking-[0.14em]',
        CLASSNAME[estado],
      )}
    >
      {estadoMeta(estado).label}
    </span>
  )
}
