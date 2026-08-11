'use client'

import { useActionState, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Factory,
  FileText,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Trees,
  Upload,
  Wrench,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  crearEmpresa,
  eliminarDocumento,
  eliminarImagen,
  subirDocumento,
  subirImagen,
  type AltaState,
} from '@/app/(app)/proveedores/alta/actions'

type TipoProveedor = 'empresa' | 'productor' | 'profesional' | 'industrial'
type Imagen = { id: number; url: string }
type Documento = { id: number; nombre: string; size: number }

const MAX_GALLERY = 8
const MAX_DOCS = 6

const TIPO_OPTIONS: {
  value: TipoProveedor
  label: string
  description: string
  Icon: typeof Building2
}[] = [
  {
    value: 'empresa',
    label: 'Empresa / Comercializadora',
    description: 'Vendo productos o servicios al ecosistema foresto-industrial.',
    Icon: Building2,
  },
  {
    value: 'productor',
    label: 'Productor forestal',
    description: 'Ofrezco madera en pie, rollizos o gestiono plantaciones.',
    Icon: Trees,
  },
  {
    value: 'industrial',
    label: 'Industrial / Aserradero',
    description: 'Transformación primaria o secundaria de madera.',
    Icon: Factory,
  },
  {
    value: 'profesional',
    label: 'Profesional independiente',
    description: 'Estudio, consultor o servicio técnico unipersonal.',
    Icon: Wrench,
  },
]

const SECTOR_OPTIONS = [
  'Forestación',
  'Aserraderos',
  'Remanufactura',
  'Vivienda Industrializada',
  'Ingeniería',
  'Arquitectura',
  'Logística',
  'Bioenergía',
  'Muebles',
  'Otros',
]

const STEPS = ['Identidad', 'Oferta', 'Medios', 'Contacto'] as const

type ConsentKey = 'terminos' | 'datos' | 'veracidad' | 'comunicaciones'

const CONSENTIMIENTOS: { key: ConsentKey; required: boolean; label: string; detail: string }[] = [
  {
    key: 'terminos',
    required: true,
    label: 'Acepto los términos y condiciones de la red PROMADERA',
    detail:
      'Entiendo que la publicación de la ficha queda sujeta a la revisión y aprobación del equipo, y que puede ser despublicada si la información deja de ser válida.',
  },
  {
    key: 'datos',
    required: true,
    label: 'Autorizo el tratamiento de los datos de mi empresa',
    detail:
      'PROMADERA puede almacenar y procesar los datos y la documentación cargados para verificar la empresa, publicar la ficha institucional y derivar solicitudes de cotización. Los datos de contacto y los documentos no se muestran públicamente.',
  },
  {
    key: 'veracidad',
    required: true,
    label: 'Declaro que la información y la documentación son veraces',
    detail: 'Soy responsable de los datos declarados y cuento con autorización para representar a la empresa.',
  },
  {
    key: 'comunicaciones',
    required: false,
    label: 'Quiero recibir novedades y oportunidades de la red (opcional)',
    detail: 'Avisos sobre licitaciones, programas y actividades. Podés darte de baja en cualquier momento.',
  },
]

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

const initialState: AltaState = {}

export function AltaWizard({
  defaults,
}: {
  defaults: { nombre: string; ubicacion: string; telefono: string }
}) {
  const [state, formAction, isPending] = useActionState(crearEmpresa, initialState)

  const [step, setStep] = useState(0)
  const [consents, setConsents] = useState<Record<ConsentKey, boolean>>({
    terminos: false,
    datos: false,
    veracidad: false,
    comunicaciones: false,
  })

  // identidad
  const [tipo, setTipo] = useState<TipoProveedor>('empresa')
  const [nombre, setNombre] = useState(defaults.nombre)
  const [sector, setSector] = useState(SECTOR_OPTIONS[0])
  const [descripcion, setDescripcion] = useState('')

  // oferta
  const [servicios, setServicios] = useState<string[]>([])
  const [servicioInput, setServicioInput] = useState('')
  const [productos, setProductos] = useState<string[]>([])
  const [productoInput, setProductoInput] = useState('')

  // medios
  const [logo, setLogo] = useState<Imagen | null>(null)
  const [logoBusy, setLogoBusy] = useState(false)
  const [galeria, setGaleria] = useState<Imagen[]>([])
  const [galeriaBusy, setGaleriaBusy] = useState(false)
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [docsBusy, setDocsBusy] = useState(false)

  const logoInput = useRef<HTMLInputElement>(null)
  const galeriaInput = useRef<HTMLInputElement>(null)
  const docsInput = useRef<HTMLInputElement>(null)

  // contacto
  const [ubicacion, setUbicacion] = useState(defaults.ubicacion)
  const [telefono, setTelefono] = useState(defaults.telefono)
  const [whatsapp, setWhatsapp] = useState('')
  const [sitioWeb, setSitioWeb] = useState('')

  const toggleConsent = (key: ConsentKey) => setConsents((c) => ({ ...c, [key]: !c[key] }))
  const consentsOk = CONSENTIMIENTOS.every((c) => !c.required || consents[c.key])

  const canNext = useMemo(() => {
    if (step === 0) return nombre.trim().length > 1 && !!sector && descripcion.trim().length >= 20
    if (step === 1) return servicios.length > 0 || productos.length > 0
    if (step === 2) return true
    if (step === 3) return ubicacion.trim().length > 1 && !!(telefono.trim() || whatsapp.trim()) && consentsOk
    return true
  }, [step, nombre, sector, descripcion, servicios, productos, ubicacion, telefono, whatsapp, consentsOk])

  const addItem = (
    arr: string[],
    setArr: (v: string[]) => void,
    value: string,
    setValue: (v: string) => void,
  ) => {
    const v = value.trim()
    if (!v) return
    if (arr.includes(v)) {
      setValue('')
      return
    }
    setArr([...arr, v])
    setValue('')
  }
  const removeItem = (arr: string[], setArr: (v: string[]) => void, value: string) =>
    setArr(arr.filter((i) => i !== value))

  const handleLogo = async (file: File | undefined) => {
    if (!file) return
    setLogoBusy(true)
    try {
      const fd = new FormData()
      fd.set('file', file)
      const res = await subirImagen(fd)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      if (logo) await eliminarImagen(logo.id)
      setLogo({ id: res.id, url: res.url })
    } finally {
      setLogoBusy(false)
      if (logoInput.current) logoInput.current.value = ''
    }
  }

  const handleGaleria = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const slots = MAX_GALLERY - galeria.length
    if (slots <= 0) {
      toast.error(`Máximo ${MAX_GALLERY} imágenes en la galería.`)
      return
    }
    const list = Array.from(files).slice(0, slots)
    setGaleriaBusy(true)
    try {
      const uploaded: Imagen[] = []
      for (const file of list) {
        const fd = new FormData()
        fd.set('file', file)
        const res = await subirImagen(fd)
        if (!res.ok) {
          toast.error(`"${file.name}": ${res.error}`)
          continue
        }
        uploaded.push({ id: res.id, url: res.url })
      }
      if (uploaded.length) setGaleria((arr) => [...arr, ...uploaded])
    } finally {
      setGaleriaBusy(false)
      if (galeriaInput.current) galeriaInput.current.value = ''
    }
  }

  const removeGaleriaItem = async (img: Imagen) => {
    setGaleria((arr) => arr.filter((i) => i.id !== img.id))
    await eliminarImagen(img.id).catch(() => {})
  }

  const handleDocs = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const slots = MAX_DOCS - documentos.length
    if (slots <= 0) {
      toast.error(`Máximo ${MAX_DOCS} documentos.`)
      return
    }
    const list = Array.from(files).slice(0, slots)
    setDocsBusy(true)
    try {
      const uploaded: Documento[] = []
      for (const file of list) {
        const fd = new FormData()
        fd.set('file', file)
        const res = await subirDocumento(fd)
        if (!res.ok) {
          toast.error(`"${file.name}": ${res.error}`)
          continue
        }
        uploaded.push({ id: res.id, nombre: file.name, size: file.size })
      }
      if (uploaded.length) setDocumentos((arr) => [...arr, ...uploaded])
    } finally {
      setDocsBusy(false)
      if (docsInput.current) docsInput.current.value = ''
    }
  }

  const removeDoc = async (doc: Documento) => {
    setDocumentos((arr) => arr.filter((d) => d.id !== doc.id))
    await eliminarDocumento(doc.id).catch(() => {})
  }

  return (
    <form action={formAction} className="container-prose section max-w-2xl">
      <p className="text-eyebrow mb-3 text-primary">Alta de proveedor</p>
      <h1 className="mb-2 text-balance font-display text-3xl md:text-4xl">
        Sumá tu empresa al directorio.
      </h1>
      <p className="mb-10 max-w-lg text-muted-foreground">
        Cuatro pasos cortos: identidad, oferta, medios y contacto. Al enviarla, tu ficha entra en
        revisión del equipo PROMADERA.
      </p>

      <input type="hidden" name="tipoProveedor" value={tipo} />
      <input type="hidden" name="nombre" value={nombre} />
      <input type="hidden" name="sector" value={sector} />
      <input type="hidden" name="descripcion" value={descripcion} />
      {servicios.map((s) => (
        <input key={s} type="hidden" name="servicios" value={s} />
      ))}
      {productos.map((p) => (
        <input key={p} type="hidden" name="productos" value={p} />
      ))}
      {logo && <input type="hidden" name="logoId" value={logo.id} />}
      {galeria.map((g) => (
        <input key={g.id} type="hidden" name="galeriaIds" value={g.id} />
      ))}
      {documentos.map((d) => (
        <input key={d.id} type="hidden" name="documentoIds" value={d.id} />
      ))}
      <input type="hidden" name="ubicacion" value={ubicacion} />
      <input type="hidden" name="telefono" value={telefono} />
      <input type="hidden" name="whatsapp" value={whatsapp} />
      <input type="hidden" name="sitioWeb" value={sitioWeb} />

      {/* Stepper */}
      <div className="mb-10 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'grid h-8 w-8 place-items-center rounded-full text-xs font-medium transition-colors',
                i < step
                  ? 'bg-primary text-primary-foreground'
                  : i === step
                    ? 'border border-primary bg-primary/15 text-primary'
                    : 'bg-muted text-muted-foreground',
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('h-px flex-1', i < step ? 'bg-primary' : 'bg-border')} />
            )}
          </div>
        ))}
      </div>

      <h2 className="mb-6 font-display text-2xl">{STEPS[step]}</h2>

      <div className={cn('space-y-6', step !== 0 && 'hidden')}>
        <div>
          <p className="mb-3 text-sm font-medium">Tipo de proveedor *</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {TIPO_OPTIONS.map(({ value, label, description, Icon }) => {
              const active = tipo === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTipo(value)}
                  className={cn(
                    'flex items-start gap-3 border p-4 text-left transition-all hover:bg-muted/40',
                    active ? 'border-primary bg-primary/5' : 'border-border',
                  )}
                >
                  <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-xs text-muted-foreground">{description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <Label htmlFor="nombre-input">Nombre de la empresa *</Label>
          <Input
            id="nombre-input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={120}
          />
        </div>

        <div>
          <Label htmlFor="sector-input">Sector *</Label>
          <select
            id="sector-input"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="h-10 w-full border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
          >
            {SECTOR_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="descripcion-input">Descripción corta *</Label>
          <Textarea
            id="descripcion-input"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="¿Qué hace tu empresa y qué la diferencia? (mínimo 20 caracteres)"
          />
          <p className="mt-1 text-xs text-muted-foreground">{descripcion.length}/500</p>
        </div>
      </div>

      <div className={cn('space-y-8', step !== 1 && 'hidden')}>
        <div>
          <Label>Servicios que ofrecés</Label>
          <p className="mb-3 text-xs text-muted-foreground">
            Sumá uno por línea (ej: Asesoramiento técnico, Diseño estructural).
          </p>
          <div className="flex gap-2">
            <Input
              value={servicioInput}
              onChange={(e) => setServicioInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addItem(servicios, setServicios, servicioInput, setServicioInput)
                }
              }}
              placeholder="Agregar servicio"
              maxLength={80}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addItem(servicios, setServicios, servicioInput, setServicioInput)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {servicios.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {servicios.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 bg-muted px-3 py-1 text-sm">
                  {s}
                  <button
                    type="button"
                    onClick={() => removeItem(servicios, setServicios, s)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label>Productos que vendés</Label>
          <p className="mb-3 text-xs text-muted-foreground">
            Opcional. Ej: Madera aserrada, Tableros, Pellets.
          </p>
          <div className="flex gap-2">
            <Input
              value={productoInput}
              onChange={(e) => setProductoInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addItem(productos, setProductos, productoInput, setProductoInput)
                }
              }}
              placeholder="Agregar producto"
              maxLength={80}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addItem(productos, setProductos, productoInput, setProductoInput)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {productos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {productos.map((p) => (
                <span key={p} className="inline-flex items-center gap-1.5 bg-muted px-3 py-1 text-sm">
                  {p}
                  <button
                    type="button"
                    onClick={() => removeItem(productos, setProductos, p)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Necesitás al menos un servicio o producto para continuar.
        </p>
      </div>

      <div className={cn('space-y-10', step !== 2 && 'hidden')}>
        <div>
          <Label className="text-sm font-medium">Logo</Label>
          <p className="mb-3 text-xs text-muted-foreground">
            Una imagen cuadrada queda mejor. JPG / PNG / WebP, máx 5 MB.
          </p>
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden border border-border bg-muted/40">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo.url} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex gap-2">
              <input
                ref={logoInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(e) => handleLogo(e.target.files?.[0])}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => logoInput.current?.click()}
                disabled={logoBusy}
              >
                {logoBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {logo ? 'Reemplazar' : 'Subir logo'}
              </Button>
              {logo && !logoBusy && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={async () => {
                    const img = logo
                    setLogo(null)
                    await eliminarImagen(img.id).catch(() => {})
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Galería de imágenes</Label>
          <p className="mb-3 text-xs text-muted-foreground">
            Hasta {MAX_GALLERY} fotos de tus obras, productos o instalaciones. Máx 5 MB cada una.
          </p>

          {galeria.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {galeria.map((img) => (
                <div key={img.id} className="group relative aspect-square overflow-hidden border border-border bg-muted/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGaleriaItem(img)}
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center bg-background/90 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Eliminar imagen"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={galeriaInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={(e) => handleGaleria(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => galeriaInput.current?.click()}
            disabled={galeriaBusy || galeria.length >= MAX_GALLERY}
          >
            {galeriaBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Agregar imágenes ({galeria.length}/{MAX_GALLERY})
          </Button>
        </div>

        <div>
          <Label className="text-sm font-medium">Documentos institucionales</Label>
          <p className="mb-3 text-xs text-muted-foreground">
            Brochures, fichas técnicas, certificaciones. PDF, máx 15 MB cada uno. Solo vos y el
            equipo PROMADERA pueden verlos.
          </p>

          {documentos.length > 0 && (
            <ul className="mb-3 space-y-2">
              {documentos.map((d) => (
                <li key={d.id} className="flex items-center gap-3 border border-border bg-muted/30 p-3">
                  <FileText className="h-4 w-4 shrink-0 text-accent" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{d.nombre}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(d.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDoc(d)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Eliminar documento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <input
            ref={docsInput}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={(e) => handleDocs(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => docsInput.current?.click()}
            disabled={docsBusy || documentos.length >= MAX_DOCS}
          >
            {docsBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Agregar PDFs ({documentos.length}/{MAX_DOCS})
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Todos los medios son opcionales — podés sumarlos ahora o más adelante.
        </p>
      </div>

      <div className={cn('space-y-4', step !== 3 && 'hidden')}>
        <div>
          <Label htmlFor="ubicacion-input">Ubicación *</Label>
          <Input
            id="ubicacion-input"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="Ciudad, Provincia"
            maxLength={120}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="telefono-input">Teléfono</Label>
            <Input
              id="telefono-input"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              maxLength={30}
              placeholder="+54 379 ..."
            />
          </div>
          <div>
            <Label htmlFor="whatsapp-input">WhatsApp</Label>
            <Input
              id="whatsapp-input"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              maxLength={30}
              placeholder="+54 9 379 ..."
            />
          </div>
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">Indicá al menos uno.</p>
        <div>
          <Label htmlFor="sitio-web-input">Sitio web</Label>
          <Input
            id="sitio-web-input"
            value={sitioWeb}
            onChange={(e) => setSitioWeb(e.target.value)}
            type="url"
            maxLength={200}
            placeholder="https://"
          />
        </div>

        <div className="mt-8 border border-border p-5">
          <p className="text-eyebrow mb-1 text-muted-foreground">Consentimientos</p>
          <h2 className="mb-4 text-lg">Antes de enviar, confirmá lo siguiente.</h2>
          <ul className="space-y-4">
            {CONSENTIMIENTOS.map((c) => (
              <li key={c.key} className="flex gap-3">
                <Checkbox
                  id={`consent-${c.key}`}
                  checked={consents[c.key]}
                  onCheckedChange={() => toggleConsent(c.key)}
                  className="mt-0.5"
                />
                <div className="min-w-0">
                  <Label htmlFor={`consent-${c.key}`} className="cursor-pointer text-sm font-medium leading-snug">
                    {c.label}
                    {c.required && <span className="text-primary"> *</span>}
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Podés leer cómo tratamos la información en{' '}
            <Link href="/confianza" className="text-primary hover:underline">
              Confianza y privacidad
            </Link>
            . Para revocar un consentimiento o pedir la baja de tus datos, escribinos desde{' '}
            <Link href="/contacto" className="text-primary hover:underline">
              Contacto
            </Link>
            .
          </p>
        </div>

        <div className="mt-6 border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          Al finalizar, tu solicitud queda en revisión. Te avisamos cuando se publique y podés
          seguir el estado desde tu panel.
        </div>

        <input type="hidden" name="consentTerminos" value={consents.terminos ? 'on' : ''} />
        <input type="hidden" name="consentDatos" value={consents.datos ? 'on' : ''} />
        <input type="hidden" name="consentVeracidad" value={consents.veracidad ? 'on' : ''} />
        <input type="hidden" name="consentComunicaciones" value={consents.comunicaciones ? 'on' : ''} />

        {state.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
      </div>

      <div className="mt-10 flex justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || isPending}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
            Siguiente <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={isPending || !canNext || logoBusy || galeriaBusy || docsBusy}>
            {isPending ? 'Enviando...' : 'Enviar a revisión'}
          </Button>
        )}
      </div>
    </form>
  )
}
