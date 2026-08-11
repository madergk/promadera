'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Send,
  Upload,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EstadoBadge } from '@/components/cotizaciones/estado-badge'
import { HiloCotizacion } from '@/components/cotizaciones/hilo-cotizacion'
import type { HiloItem } from '@/components/cotizaciones/hilo-actions'
import { guardarPresupuesto, subirPresupuestoPdf } from '@/app/(app)/panel-proveedor/actions'
import type { EstadoCotizacion } from '@/payload/collections/Cotizaciones'

const MONEDAS = ['ARS', 'USD', 'EUR'] as const

export interface CotizacionProveedorData {
  id: number
  empresaNombre: string
  tipoConsulta: string
  referencia: string | null
  descripcion: string
  cantidad: string | null
  plazo: string | null
  ubicacion: string | null
  presupuestoCliente: string | null
  estado: EstadoCotizacion
  createdAt: string
  presupuestoMonto: number | null
  presupuestoMoneda: string
  presupuestoValidezDias: number | null
  presupuestoPlazo: string | null
  respuesta: string | null
  archivo: { id: number; nombre: string; url: string | null } | null
  solicitanteNombre: string | null
  solicitanteEmpresa: string | null
  solicitanteEmail: string | null
  solicitanteTelefono: string | null
}

export function DetalleCotizacionProveedor({
  cot,
  hiloInicial,
}: {
  cot: CotizacionProveedorData
  hiloInicial: HiloItem[]
}) {
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)

  const [monto, setMonto] = useState(cot.presupuestoMonto?.toString() ?? '')
  const [moneda, setMoneda] = useState(cot.presupuestoMoneda || 'ARS')
  const [validez, setValidez] = useState(cot.presupuestoValidezDias?.toString() ?? '15')
  const [plazoEjec, setPlazoEjec] = useState(cot.presupuestoPlazo ?? '')
  const [respuesta, setRespuesta] = useState(cot.respuesta ?? '')
  const [archivo, setArchivo] = useState(cot.archivo)
  const [uploading, setUploading] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleUpload = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.set('file', file)
      const res = await subirPresupuestoPdf(cot.id, fd)
      if (!res.ok || !res.id) {
        toast.error(res.error ?? 'No pudimos subir el archivo')
        return
      }
      setArchivo({ id: res.id, nombre: file.name, url: null })
      toast.success('PDF subido. Recordá guardar la respuesta.')
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const submit = (marcarRespondida: boolean) => {
    startTransition(async () => {
      const res = await guardarPresupuesto(cot.id, {
        montoStr: monto,
        moneda,
        validezStr: validez,
        plazoEjec,
        respuesta,
        archivoId: archivo?.id ?? null,
        marcarRespondida,
      })
      if (!res.ok) {
        toast.error(res.error ?? 'No pudimos guardar la respuesta')
        return
      }
      toast.success(marcarRespondida ? 'Presupuesto enviado al cliente' : 'Borrador guardado')
      if (marcarRespondida) router.push('/panel-proveedor')
      else router.refresh()
    })
  }

  return (
    <div className="container-prose section max-w-6xl">
      <Button asChild variant="ghost" className="-ml-3 mb-6">
        <Link href="/panel-proveedor">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al listado
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="order-2 space-y-6 lg:order-1">
          <section className="border border-border p-6">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <div className="mb-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {cot.empresaNombre} · {cot.tipoConsulta}
                </div>
                <h2 className="font-display text-2xl">{cot.referencia || 'Solicitud sin título'}</h2>
              </div>
              <EstadoBadge estado={cot.estado} />
            </div>
            <p className="whitespace-pre-line leading-relaxed text-foreground/85">{cot.descripcion}</p>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <Dato k="Cantidad / superficie" v={cot.cantidad} />
              <Dato k="Plazo deseado" v={cot.plazo} />
              <Dato k="Ubicación" v={cot.ubicacion} />
              <Dato k="Presupuesto del cliente" v={cot.presupuestoCliente} />
            </div>
          </section>

          <HiloCotizacion
            cotizacionId={cot.id}
            perspectiva="proveedor"
            otraParteNombre={cot.solicitanteNombre}
            itemsIniciales={hiloInicial}
            revalidatePathTo={`/panel-proveedor/${cot.id}`}
          />

          <section className="border border-border p-6">
            <h3 className="mb-4 font-display text-lg">Cargar presupuesto</h3>
            <div className="mb-4 grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Label htmlFor="monto">Monto *</Label>
                <Input
                  id="monto"
                  inputMode="decimal"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="Ej.: 1850000"
                  maxLength={14}
                />
              </div>
              <div>
                <Label htmlFor="moneda">Moneda</Label>
                <Select value={moneda} onValueChange={setMoneda}>
                  <SelectTrigger id="moneda">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONEDAS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="validez">Validez (días)</Label>
                <Input
                  id="validez"
                  inputMode="numeric"
                  value={validez}
                  onChange={(e) => setValidez(e.target.value)}
                  placeholder="15"
                  maxLength={3}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="plazoEjec">Plazo de ejecución / entrega</Label>
                <Input
                  id="plazoEjec"
                  value={plazoEjec}
                  onChange={(e) => setPlazoEjec(e.target.value)}
                  placeholder="Ej.: 90 días desde la seña"
                  maxLength={120}
                />
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="respuesta">Mensaje para el cliente *</Label>
              <Textarea
                id="respuesta"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                rows={6}
                maxLength={4000}
                placeholder="Alcance, materiales, condiciones comerciales, forma de pago…"
              />
            </div>

            <div className="border border-dashed border-border p-4">
              <div className="mb-3 flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Presupuesto formal (PDF, opcional)</div>
                  <p className="text-xs text-muted-foreground">
                    Hasta 8 MB. Lo verá solo el solicitante de esta cotización.
                  </p>
                </div>
              </div>
              {archivo ? (
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="flex-1 truncate text-muted-foreground">{archivo.nombre}</span>
                  {archivo.url && (
                    <Button asChild variant="outline" size="sm">
                      <a href={archivo.url} target="_blank" rel="noreferrer">
                        <Download className="mr-1.5 h-4 w-4" /> Ver
                      </a>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setArchivo(null)}>
                    Reemplazar
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    ref={fileInput}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleUpload(e.target.files?.[0])}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInput.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-1.5 h-4 w-4" />
                    )}
                    Subir PDF
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" onClick={() => submit(false)} disabled={pending}>
                {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Guardar borrador
              </Button>
              <Button onClick={() => submit(true)} disabled={pending}>
                {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Enviar presupuesto al cliente
              </Button>
            </div>
          </section>
        </div>

        <aside className="order-1 space-y-4 lg:order-2">
          <section className="border border-border p-5">
            <h3 className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Solicitante
            </h3>
            <div className="space-y-2 text-sm">
              <div className="font-medium text-foreground">{cot.solicitanteNombre || '—'}</div>
              {cot.solicitanteEmpresa && (
                <div className="text-muted-foreground">{cot.solicitanteEmpresa}</div>
              )}
              {cot.solicitanteEmail && (
                <a
                  href={`mailto:${cot.solicitanteEmail}`}
                  className="block break-all text-primary hover:underline"
                >
                  {cot.solicitanteEmail}
                </a>
              )}
              {cot.solicitanteTelefono && (
                <a href={`tel:${cot.solicitanteTelefono}`} className="block text-primary hover:underline">
                  {cot.solicitanteTelefono}
                </a>
              )}
            </div>
            <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
              Recibido el{' '}
              {new Date(cot.createdAt).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Dato({ k, v }: { k: string; v: string | null }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{k}</div>
      <div className="text-sm">{v || '—'}</div>
    </div>
  )
}
