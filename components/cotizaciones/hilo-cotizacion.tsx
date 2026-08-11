'use client'

import { useEffect, useState, useTransition } from 'react'
import { Loader2, MessageSquare, Send } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { enviarMensajeHilo, listarHilo, type HiloItem } from './hilo-actions'
import { estadoMeta } from './estado-badge'
import type { EstadoCotizacion } from '@/payload/collections/Cotizaciones'

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

export function HiloCotizacion({
  cotizacionId,
  perspectiva,
  otraParteNombre,
  itemsIniciales,
  revalidatePathTo,
}: {
  cotizacionId: number
  perspectiva: 'solicitante' | 'proveedor'
  otraParteNombre?: string | null
  /** Si no se pasa, el componente carga el hilo solo al montarse. */
  itemsIniciales?: HiloItem[]
  revalidatePathTo: string
}) {
  const [items, setItems] = useState<HiloItem[] | null>(itemsIniciales ?? null)
  const [text, setText] = useState('')
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (itemsIniciales) return
    listarHilo(cotizacionId).then(setItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cotizacionId])

  const enviar = () => {
    const value = text
    if (!value.trim()) return
    startTransition(async () => {
      const res = await enviarMensajeHilo(cotizacionId, value, revalidatePathTo)
      if (res.ok) {
        setText('')
        listarHilo(cotizacionId).then(setItems)
      } else {
        toast.error(res.error ?? 'No pudimos enviar el mensaje.')
      }
    })
  }

  return (
    <section className="border border-border">
      <header className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-3">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium">Conversación</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          Hablás con {otraParteNombre || (perspectiva === 'solicitante' ? 'el proveedor' : 'el cliente')}
        </span>
      </header>

      <div className="max-h-[420px] space-y-3 overflow-y-auto bg-background p-5">
        {items === null ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando mensajes…
          </div>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Todavía no hay mensajes en este hilo. Escribí el primero para coordinar detalles antes
            del presupuesto final.
          </p>
        ) : (
          items.map((it) => {
            if (it.accion !== 'mensaje') {
              const nuevo = it.estadoNuevo ? estadoMeta(it.estadoNuevo as EstadoCotizacion).label : null
              return (
                <div key={it.id} className="text-center">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {nuevo ? `Estado actualizado: ${nuevo}` : 'Actualización'} · {fmtTime(it.createdAt)}
                  </span>
                </div>
              )
            }
            return (
              <div key={it.id} className={cn('flex flex-col', it.esMio ? 'items-end' : 'items-start')}>
                <div
                  className={cn(
                    'max-w-[80%] whitespace-pre-line px-3.5 py-2 text-sm',
                    it.esMio
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-card text-foreground',
                  )}
                >
                  {it.mensaje}
                </div>
                <span className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {it.esMio ? 'Vos' : perspectiva === 'solicitante' ? 'Proveedor' : 'Cliente'} ·{' '}
                  {fmtTime(it.createdAt)}
                </span>
              </div>
            )
          })
        )}
      </div>

      <div className="flex items-end gap-2 border-t border-border bg-muted/20 p-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              enviar()
            }
          }}
          placeholder="Escribí tu mensaje… (⌘/Ctrl + Enter para enviar)"
          rows={2}
          maxLength={4000}
          className="flex-1 resize-none"
        />
        <Button onClick={enviar} disabled={!text.trim() || pending} size="icon" className="h-10 w-10 shrink-0">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </section>
  )
}
