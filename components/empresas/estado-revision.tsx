import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'

import { getCurrentUser } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { estadoEmpresaMeta } from '@/lib/empresa-estado'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Estado de revisión de las fichas del usuario logueado. */
export async function EstadoRevision() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="border border-border bg-background p-6 md:p-8">
        <p className="text-eyebrow mb-3 text-muted-foreground">Estado de revisión</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Ingresá a tu cuenta para enviar tu solicitud y seguir el estado de la revisión.
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/auth">Ingresar o crear cuenta</Link>
        </Button>
      </div>
    )
  }

  const payload = await getPayloadClient()
  const { docs: empresas } = await payload.find({
    collection: 'empresas',
    where: { user: { equals: user.id } },
    sort: '-createdAt',
    depth: 0,
    limit: 50,
    overrideAccess: false,
    user,
  })

  if (empresas.length === 0) {
    return (
      <div className="border border-border bg-background p-6 md:p-8">
        <p className="text-eyebrow mb-3 text-muted-foreground">Estado de revisión</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Todavía no enviaste ninguna solicitud. El formulario toma unos minutos y podés adjuntar
          la documentación en el mismo paso.
        </p>
        <Button asChild className="mt-5">
          <Link href="/proveedores/alta">
            Completar el formulario <ArrowRight />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border border border-border bg-background">
      {empresas.map((e) => {
        const meta = estadoEmpresaMeta(e.estado)
        const docCount = e.documentos?.length ?? 0
        return (
          <div key={e.id} className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]',
                  meta.badge,
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
                {meta.label}
              </span>
              <p className="font-display text-lg text-foreground">{e.nombre}</p>
            </div>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {meta.publico}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Enviada el {new Date(e.createdAt).toLocaleDateString('es-AR')} ·{' '}
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {docCount} {docCount === 1 ? 'documento adjunto' : 'documentos adjuntos'}
              </span>
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/panel-proveedor">Ir a mi panel</Link>
              </Button>
              {e.estado === 'publicado' && (
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/proveedores/${e.slug}`}>Ver mi perfil público</Link>
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
