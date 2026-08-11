export type EstadoEmpresa = 'borrador' | 'en_revision' | 'publicado' | 'archivado'

export const EMPRESA_ESTADOS: {
  value: EstadoEmpresa
  label: string
  badge: string
  dot: string
  publico: string
}[] = [
  {
    value: 'borrador',
    label: 'Borrador',
    badge: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
    publico: 'Tu ficha está guardada como borrador. Completala y enviala a revisión.',
  },
  {
    value: 'en_revision',
    label: 'En revisión',
    badge: 'bg-accent/10 text-accent border-accent/30',
    dot: 'bg-accent',
    publico:
      'Recibimos tu solicitud. El equipo PROMADERA está verificando los datos y la documentación cargada.',
  },
  {
    value: 'publicado',
    label: 'Publicado',
    badge: 'bg-primary/10 text-primary border-primary/30',
    dot: 'bg-primary',
    publico: 'Tu empresa está publicada en la red y puede recibir solicitudes de cotización.',
  },
  {
    value: 'archivado',
    label: 'Archivado',
    badge: 'bg-warning/10 text-warning border-warning/30',
    dot: 'bg-warning',
    publico: 'Tu ficha está archivada y no se muestra en el directorio. Escribinos si querés reactivarla.',
  },
]

const EMPRESA_ESTADO_BY = Object.fromEntries(
  EMPRESA_ESTADOS.map((e) => [e.value, e]),
) as Record<EstadoEmpresa, (typeof EMPRESA_ESTADOS)[number]>

export function estadoEmpresaMeta(estado?: string | null) {
  return EMPRESA_ESTADO_BY[(estado ?? 'borrador') as EstadoEmpresa] ?? EMPRESA_ESTADO_BY.borrador
}
