'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Building2,
  Check,
  ChevronRight,
  Loader2,
  LogIn,
  Package,
  Wrench,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useSessionUser } from '@/hooks/use-session-user'

type TipoConsulta = 'producto' | 'servicio' | 'proyecto'

interface ProductoItem {
  nombre: string
  descripcion?: string | null
  categoria?: string | null
}
interface ServicioItem {
  titulo: string
  descripcion?: string | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  empresaId: number
  empresaNombre: string
  initialTipo?: TipoConsulta
  initialReferencia?: string
  productos?: ProductoItem[]
  servicios?: ServicioItem[]
}

const schema = z.object({
  tipoConsulta: z.enum(['producto', 'servicio', 'proyecto']),
  referencia: z.string().trim().max(200).optional(),
  descripcion: z.string().trim().min(10, 'Contanos un poco más (mín. 10 caracteres)').max(2000),
  cantidad: z.string().trim().max(120).optional(),
  plazo: z.string().trim().max(120).optional(),
  ubicacion: z.string().trim().max(160).optional(),
  presupuesto: z.string().trim().max(120).optional(),
  solicitanteNombre: z.string().trim().min(2, 'Ingresá tu nombre').max(120),
  solicitanteEmail: z.string().trim().email('Email inválido').max(255),
  solicitanteTelefono: z.string().trim().max(60).optional(),
  solicitanteEmpresa: z.string().trim().max(160).optional(),
})

const STEPS = ['Tipo de consulta', 'Detalles', 'Tus datos'] as const

const tipoOptions: {
  value: TipoConsulta
  label: string
  description: string
  Icon: typeof Package
}[] = [
  {
    value: 'producto',
    label: 'Producto del catálogo',
    description: 'Pedir cotización por un ítem específico',
    Icon: Package,
  },
  {
    value: 'servicio',
    label: 'Un servicio',
    description: 'Contratar un servicio del proveedor',
    Icon: Wrench,
  },
  {
    value: 'proyecto',
    label: 'Proyecto a medida',
    description: 'Consulta abierta para una obra o desarrollo',
    Icon: Building2,
  },
]

export function CotizacionWizard({
  open,
  onOpenChange,
  empresaId,
  empresaNombre,
  initialTipo,
  initialReferencia,
  productos = [],
  servicios = [],
}: Props) {
  const { user } = useSessionUser()
  const router = useRouter()
  const pathname = usePathname()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    tipoConsulta: (initialTipo ?? 'proyecto') as TipoConsulta,
    referencia: initialReferencia ?? '',
    descripcion: '',
    cantidad: '',
    plazo: '',
    ubicacion: '',
    presupuesto: '',
    solicitanteNombre: '',
    solicitanteEmail: '',
    solicitanteTelefono: '',
    solicitanteEmpresa: '',
  })

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        solicitanteEmail: f.solicitanteEmail || user.email || '',
        solicitanteNombre: f.solicitanteNombre || user.nombreCompleto || '',
      }))
    }
  }, [user])

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const reset = () => {
    setStep(0)
    setDone(false)
    setForm({
      tipoConsulta: initialTipo ?? 'proyecto',
      referencia: initialReferencia ?? '',
      descripcion: '',
      cantidad: '',
      plazo: '',
      ubicacion: '',
      presupuesto: '',
      solicitanteNombre: '',
      solicitanteEmail: '',
      solicitanteTelefono: '',
      solicitanteEmpresa: '',
    })
  }

  const handleClose = (o: boolean) => {
    onOpenChange(o)
    if (!o) setTimeout(reset, 200)
  }

  const next = () => {
    if (step === 1 && form.descripcion.trim().length < 10) {
      toast.error('Contanos un poco más sobre tu consulta.')
      return
    }
    setStep((s) => Math.min(s + 1, 2))
  }
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const submit = async () => {
    const parsed = schema.safeParse(form)
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          empresa: empresaId,
          // solicitante lo fija el hook del server con la sesión; el valor es solo para pasar la validación required
          solicitante: user?.id,
          ...parsed.data,
          referencia: parsed.data.referencia || undefined,
          cantidad: parsed.data.cantidad || undefined,
          plazo: parsed.data.plazo || undefined,
          ubicacion: parsed.data.ubicacion || undefined,
          presupuesto: parsed.data.presupuesto || undefined,
          solicitanteTelefono: parsed.data.solicitanteTelefono || undefined,
          solicitanteEmpresa: parsed.data.solicitanteEmpresa || undefined,
        }),
      })
      if (!res.ok) throw new Error('request failed')
      setDone(true)
    } catch {
      toast.error('No pudimos enviar la solicitud. Probá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Solicitar cotización</DialogTitle>
          <DialogDescription>A {empresaNombre}</DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="space-y-4 py-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
              <LogIn className="h-7 w-7" />
            </div>
            <h3 className="font-display text-2xl">Ingresá para continuar</h3>
            <p className="mx-auto max-w-sm text-muted-foreground">
              Necesitás una cuenta para enviar la cotización y poder seguir el estado de tu
              solicitud.
            </p>
            <Button asChild className="mt-2">
              <Link href={`/auth?next=${encodeURIComponent(pathname)}`}>
                Ingresar / Crear cuenta
              </Link>
            </Button>
          </div>
        ) : done ? (
          <div className="space-y-4 py-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
              <Check className="h-7 w-7" />
            </div>
            <h3 className="font-display text-2xl">Solicitud enviada</h3>
            <p className="mx-auto max-w-sm text-muted-foreground">
              Recibimos tu consulta y la derivamos a {empresaNombre}. Vas a poder seguir el estado
              en{' '}
              <Link href="/mis-cotizaciones" className="text-primary underline">
                Mis cotizaciones
              </Link>
              .
            </p>
            <Button onClick={() => handleClose(false)} className="mt-4">
              Cerrar
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 mt-2 flex items-center gap-2">
              {STEPS.map((label, i) => (
                <div key={label} className="flex flex-1 items-center gap-2">
                  <div
                    className={cn(
                      'grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs transition-colors',
                      i < step && 'border-primary bg-primary text-primary-foreground',
                      i === step && 'border-primary font-semibold text-primary',
                      i > step && 'border-border text-muted-foreground',
                    )}
                  >
                    {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      'hidden text-xs uppercase tracking-[0.14em] sm:inline',
                      i === step ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {label}
                  </span>
                  {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
                </div>
              ))}
            </div>

            {step === 0 && (
              <div className="space-y-3">
                <p className="mb-2 text-sm text-muted-foreground">
                  ¿Sobre qué necesitás cotización?
                </p>
                {tipoOptions.map(({ value, label, description, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      if (value === 'proyecto') {
                        handleClose(false)
                        router.push(`/guia-proyecto?empresa=${encodeURIComponent(empresaId)}`)
                        return
                      }
                      set('tipoConsulta', value)
                    }}
                    className={cn(
                      'flex w-full items-start gap-4 border p-5 text-left transition-colors',
                      form.tipoConsulta === value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50',
                    )}
                  >
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">{description}</p>
                      {value === 'proyecto' && (
                        <p className="mt-1 text-xs text-primary">
                          Te llevamos al asistente IA de proyecto →
                        </p>
                      )}
                    </div>
                    {form.tipoConsulta === value && value !== 'proyecto' && (
                      <Check className="h-5 w-5 shrink-0 text-primary" />
                    )}
                  </button>
                ))}

                {form.tipoConsulta === 'producto' && productos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Elegí un producto del catálogo
                    </p>
                    <div className="max-h-64 space-y-px overflow-y-auto border border-border bg-border">
                      {productos.map((p) => (
                        <button
                          key={p.nombre}
                          type="button"
                          onClick={() => set('referencia', p.nombre)}
                          className={cn(
                            'w-full bg-background p-3 text-left text-sm transition-colors hover:bg-primary/5',
                            form.referencia === p.nombre && 'bg-primary/10',
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium">{p.nombre}</p>
                              {p.categoria && (
                                <p className="text-xs text-muted-foreground">{p.categoria}</p>
                              )}
                            </div>
                            {form.referencia === p.nombre && (
                              <Check className="h-4 w-4 shrink-0 text-primary" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      O dejalo sin seleccionar y describilo en el siguiente paso.
                    </p>
                  </div>
                )}

                {form.tipoConsulta === 'servicio' && servicios.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Elegí un servicio del proveedor
                    </p>
                    <div className="max-h-64 space-y-px overflow-y-auto border border-border bg-border">
                      {servicios.map((s) => (
                        <button
                          key={s.titulo}
                          type="button"
                          onClick={() => set('referencia', s.titulo)}
                          className={cn(
                            'w-full bg-background p-3 text-left text-sm transition-colors hover:bg-primary/5',
                            form.referencia === s.titulo && 'bg-primary/10',
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium">{s.titulo}</p>
                              {s.descripcion && (
                                <p className="line-clamp-1 text-xs text-muted-foreground">
                                  {s.descripcion}
                                </p>
                              )}
                            </div>
                            {form.referencia === s.titulo && (
                              <Check className="h-4 w-4 shrink-0 text-primary" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      O dejalo sin seleccionar y describilo en el siguiente paso.
                    </p>
                  </div>
                )}

                {initialReferencia && (
                  <div className="mt-3 border-l-2 border-primary py-1 pl-3 text-xs text-muted-foreground">
                    Referencia precargada:{' '}
                    <span className="text-foreground">{initialReferencia}</span>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="referencia">Producto o servicio de interés (opcional)</Label>
                  <Input
                    id="referencia"
                    value={form.referencia}
                    onChange={(e) => set('referencia', e.target.value)}
                    placeholder="Ej: Panel CLT 120 mm"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion">Contanos qué necesitás *</Label>
                  <Textarea
                    id="descripcion"
                    value={form.descripcion}
                    onChange={(e) => set('descripcion', e.target.value)}
                    placeholder="Alcance, uso final y especificaciones"
                    rows={4}
                    className="mt-1.5"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="cantidad">Cantidad / volumen</Label>
                    <Input
                      id="cantidad"
                      value={form.cantidad}
                      onChange={(e) => set('cantidad', e.target.value)}
                      placeholder="Ej: 200 m²"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="plazo">Plazo deseado</Label>
                    <Input
                      id="plazo"
                      value={form.plazo}
                      onChange={(e) => set('plazo', e.target.value)}
                      placeholder="Ej: 60 días"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ubicacion">Ubicación de la obra</Label>
                    <Input
                      id="ubicacion"
                      value={form.ubicacion}
                      onChange={(e) => set('ubicacion', e.target.value)}
                      placeholder="Ej: Corrientes Capital"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="presupuesto">Presupuesto estimado</Label>
                    <Input
                      id="presupuesto"
                      value={form.presupuesto}
                      onChange={(e) => set('presupuesto', e.target.value)}
                      placeholder="Opcional"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="wiz-nombre">Nombre *</Label>
                    <Input
                      id="wiz-nombre"
                      value={form.solicitanteNombre}
                      onChange={(e) => set('solicitanteNombre', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wiz-email">Email *</Label>
                    <Input
                      id="wiz-email"
                      type="email"
                      value={form.solicitanteEmail}
                      onChange={(e) => set('solicitanteEmail', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wiz-telefono">Teléfono</Label>
                    <Input
                      id="wiz-telefono"
                      value={form.solicitanteTelefono}
                      onChange={(e) => set('solicitanteTelefono', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wiz-empresa">Empresa / Estudio</Label>
                    <Input
                      id="wiz-empresa"
                      value={form.solicitanteEmpresa}
                      onChange={(e) => set('solicitanteEmpresa', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Al enviar aceptás que tus datos se compartan con {empresaNombre} para responder tu
                  consulta.
                </p>
              </div>
            )}

            <div className="mt-8 flex justify-between gap-3 border-t border-border pt-6">
              <Button variant="ghost" onClick={back} disabled={step === 0 || submitting}>
                Atrás
              </Button>
              {step < 2 ? (
                <Button onClick={next}>
                  Continuar <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={submit} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar solicitud'}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
