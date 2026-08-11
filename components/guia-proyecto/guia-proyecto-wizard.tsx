'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { jsPDF } from 'jspdf'
import {
  Home,
  Trees,
  Sparkles,
  Loader2,
  Check,
  ArrowLeft,
  ArrowRight,
  Send,
  LogIn,
  Building2,
  Download,
  Eye,
  X,
  Save,
  Trash2,
  FileText,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  buscarProveedores,
  eliminarBorrador,
  enviarCotizaciones,
  guardarBorrador,
  type Brief,
  type DraftItem,
  type EmpresaCard,
} from '@/app/(app)/guia-proyecto/actions'

type Tipo = 'vivienda' | 'exterior'
type Subtipo = { value: string; label: string; hint: string }

const SUBTIPOS: Record<Tipo, Subtipo[]> = {
  vivienda: [
    { value: 'casa_madera', label: 'Casa en madera', hint: 'Vivienda permanente, llave en mano o por etapas.' },
    { value: 'cabana', label: 'Cabaña', hint: 'Refugio o casa de fin de semana.' },
    { value: 'modulo', label: 'Módulo / prefabricada', hint: 'Construcción industrializada y transportable.' },
    { value: 'ampliacion', label: 'Ampliación en madera', hint: 'Sumar ambientes a una vivienda existente.' },
  ],
  exterior: [
    { value: 'deck', label: 'Deck / entarimado', hint: 'Pisos exteriores en madera tratada.' },
    { value: 'pergola', label: 'Pérgola', hint: 'Cubierta liviana, sombra o parral.' },
    { value: 'quincho', label: 'Quincho / galería', hint: 'Espacio techado para reuniones.' },
    { value: 'playroom', label: 'Playroom / estudio', hint: 'Construcción auxiliar en el jardín.' },
  ],
}

const TERMINACIONES = [
  'Aislación térmica',
  'Cubierta de chapa',
  'Cubierta de tejas',
  'Aberturas de aluminio',
  'Aberturas de madera',
  'Instalación eléctrica',
  'Instalación sanitaria',
  'Calefacción / estufa',
]

const STEPS = ['Tipo', 'Detalles', 'Brief con IA', 'Proveedores'] as const

export type RefProyecto = {
  slug: string
  titulo: string
  categoria: string | null
  ubicacion: string | null
  anio: number | null
  sistemaConstructivo: string | null
  materiales: string[]
  imagen: string | null
  tipoInferido: Tipo
}

type FormState = {
  tipo: Tipo | ''
  subtipo: string
  superficie: string
  ubicacion: string
  plazo: string
  presupuesto: string
  terminaciones: string[]
  notas: string
  brief: Brief | null
}

const emptyForm: FormState = {
  tipo: '',
  subtipo: '',
  superficie: '',
  ubicacion: '',
  plazo: '',
  presupuesto: '',
  terminaciones: [],
  notas: '',
  brief: null,
}

function draftToForm(d: DraftItem): FormState {
  return {
    tipo: d.tipo ?? '',
    subtipo: d.subtipo ?? '',
    superficie: d.superficie ?? '',
    ubicacion: d.ubicacion ?? '',
    plazo: d.plazo ?? '',
    presupuesto: d.presupuesto ?? '',
    terminaciones: d.terminaciones,
    notas: d.notas ?? '',
    brief: d.brief,
  }
}

export function GuiaProyectoWizard({
  refSlug,
  refProyecto,
  draftsIniciales,
  loggedIn,
  empresaPreseleccionada,
}: {
  refSlug: string | null
  refProyecto: RefProyecto | null
  draftsIniciales: DraftItem[]
  loggedIn: boolean
  empresaPreseleccionada: EmpresaCard | null
}) {
  const router = useRouter()

  const initialMatch = useMemo(
    () => (refSlug ? draftsIniciales.find((d) => d.refSlug === refSlug) : undefined),
    [refSlug, draftsIniciales],
  )

  const [step, setStep] = useState(initialMatch ? Math.min(initialMatch.wizardStep, STEPS.length - 1) : 0)
  const [draftId, setDraftId] = useState<number | null>(initialMatch?.id ?? null)
  const [drafts, setDrafts] = useState<DraftItem[]>(draftsIniciales)
  const [form, setForm] = useState<FormState>(() => {
    if (initialMatch) return draftToForm(initialMatch)
    if (refProyecto) {
      return {
        ...emptyForm,
        tipo: refProyecto.tipoInferido,
        ubicacion: refProyecto.ubicacion ?? '',
        notas: `Inspirado en el proyecto "${refProyecto.titulo}" (${refProyecto.ubicacion ?? '—'}, ${refProyecto.anio ?? '—'}). Sistema de referencia: ${refProyecto.sistemaConstructivo ?? '—'}. Materiales: ${refProyecto.materiales.join(', ') || '—'}.`,
      }
    }
    return emptyForm
  })

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const [generating, setGenerating] = useState(false)
  const [empresas, setEmpresas] = useState<EmpresaCard[]>([])
  const [loadingEmpresas, setLoadingEmpresas] = useState(false)
  const [empresasLoadedFor, setEmpresasLoadedFor] = useState<string | null>(null)
  const [selectedEmpresas, setSelectedEmpresas] = useState<number[]>([])
  const [sending, setSending] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [pending, startTransition] = useTransition()

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [buildingPreview, setBuildingPreview] = useState(false)

  const subtipoLabel = useMemo(() => {
    if (!form.tipo || !form.subtipo) return ''
    return SUBTIPOS[form.tipo].find((s) => s.value === form.subtipo)?.label ?? form.subtipo
  }, [form.tipo, form.subtipo])

  const toggleTerm = (t: string) =>
    set('terminaciones', form.terminaciones.includes(t) ? form.terminaciones.filter((x) => x !== t) : [...form.terminaciones, t])

  const canNext = () => {
    if (step === 0) return !!form.tipo && !!form.subtipo
    if (step === 1) return form.superficie.trim().length > 0 && form.ubicacion.trim().length > 0
    if (step === 2) return !!form.brief
    return true
  }

  const applyDraft = (d: DraftItem) => {
    setDraftId(d.id)
    setStep(Math.min(Math.max(d.wizardStep, 0), STEPS.length - 1))
    setForm(draftToForm(d))
    toast.success('Borrador cargado')
  }

  const goAuth = (next = '/guia-proyecto') => router.push(`/auth?next=${encodeURIComponent(next)}`)

  const saveDraft = () => {
    if (!loggedIn) {
      goAuth(`/guia-proyecto${refSlug ? `?ref=${refSlug}` : ''}`)
      return
    }
    setSavingDraft(true)
    startTransition(async () => {
      const titulo =
        refProyecto?.titulo ||
        subtipoLabel ||
        (form.tipo === 'vivienda' ? 'Vivienda en madera' : form.tipo === 'exterior' ? 'Construcción exterior' : 'Proyecto sin título')
      const res = await guardarBorrador({
        draftId,
        refSlug,
        titulo,
        step,
        ...form,
      })
      setSavingDraft(false)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      setDraftId(res.id)
      const updated: DraftItem = {
        id: res.id,
        refSlug,
        titulo,
        wizardStep: step,
        tipo: form.tipo || null,
        subtipo: form.subtipo || null,
        superficie: form.superficie || null,
        ubicacion: form.ubicacion || null,
        plazo: form.plazo || null,
        presupuesto: form.presupuesto || null,
        terminaciones: form.terminaciones,
        notas: form.notas || null,
        brief: form.brief,
        updatedAt: new Date().toISOString(),
      }
      setDrafts((prev) => [updated, ...prev.filter((d) => d.id !== res.id)].slice(0, 10))
      toast.success('Borrador guardado')
    })
  }

  const deleteDraft = (id: number) => {
    startTransition(async () => {
      const res = await eliminarBorrador(id)
      if (!res.ok) {
        toast.error(res.error ?? 'No pudimos eliminar el borrador')
        return
      }
      setDrafts((prev) => prev.filter((d) => d.id !== id))
      if (draftId === id) setDraftId(null)
      toast.success('Borrador eliminado')
    })
  }

  const generateBrief = async () => {
    if (!form.tipo || !form.subtipo) return
    if (!loggedIn) {
      toast.error('Iniciá sesión para generar el brief con IA.')
      goAuth()
      return
    }
    setGenerating(true)
    set('brief', null)
    try {
      const res = await fetch('/api/proyecto-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: form.tipo,
          subtipo: subtipoLabel,
          superficie: form.superficie,
          ubicacion: form.ubicacion,
          plazo: form.plazo,
          presupuesto: form.presupuesto,
          terminaciones: form.terminaciones,
          notas: form.notas,
        }),
      })
      if (res.status === 401) {
        goAuth()
        return
      }
      if (res.status === 429) {
        toast.error('Demasiadas solicitudes. Probá en unos segundos.')
        return
      }
      if (res.status === 402) {
        toast.error('Se agotaron los créditos del asistente. Avisanos para reponer.')
        return
      }
      if (!res.ok) {
        toast.error('No pudimos generar el brief. Intentá nuevamente.')
        return
      }
      const data = (await res.json()) as Brief
      set('brief', data)
    } catch {
      toast.error('Error al generar el brief')
    } finally {
      setGenerating(false)
    }
  }

  const loadEmpresas = (rubros: string[]) => {
    const key = rubros.join('|')
    if (empresasLoadedFor === key) return
    setLoadingEmpresas(true)
    startTransition(async () => {
      const found = await buscarProveedores(rubros)
      const list = empresaPreseleccionada
        ? [empresaPreseleccionada, ...found.filter((e) => e.id !== empresaPreseleccionada.id)]
        : found
      setEmpresas(list)
      setSelectedEmpresas(
        empresaPreseleccionada
          ? [empresaPreseleccionada.id]
          : list.slice(0, Math.min(3, list.length)).map((e) => e.id),
      )
      setEmpresasLoadedFor(key)
      setLoadingEmpresas(false)
    })
  }

  const goToStep = (s: number) => {
    setStep(s)
    if (s === 3) loadEmpresas(form.brief?.rubros ?? [])
  }

  const fileSlug = () =>
    `brief-madera-correntina-${(subtipoLabel || 'proyecto').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'proyecto'}`

  const buildPDF = (): jsPDF | null => {
    if (!form.brief) return null
    const brief = form.brief

    const BRAND = {
      primary: [47, 127, 81] as [number, number, number],
      primaryDark: [18, 64, 41] as [number, number, number],
      cream: [248, 246, 241] as [number, number, number],
      ink: [18, 43, 29] as [number, number, number],
      muted: [96, 110, 100] as [number, number, number],
      rule: [210, 206, 196] as [number, number, number],
    }

    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const margin = 48
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const maxWidth = pageWidth - margin * 2
    const headerH = 70
    const footerH = 46
    const contentTop = headerH + 28
    const contentBottom = pageHeight - footerH - 16
    let y = contentTop

    const drawHeader = () => {
      doc.setFillColor(...BRAND.primaryDark)
      doc.rect(0, 0, pageWidth, headerH, 'F')
      doc.setFillColor(...BRAND.primary)
      doc.rect(0, headerH, pageWidth, 3, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...BRAND.cream)
      doc.text('PROMADERA', pageWidth - margin, headerH / 2 - 2, { align: 'right' })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(220, 230, 222)
      doc.text('Plataforma de proyectos en madera', pageWidth - margin, headerH / 2 + 12, { align: 'right' })
    }

    const drawFooter = (pageNum: number, pageCount: number) => {
      const fy = pageHeight - footerH
      doc.setDrawColor(...BRAND.rule)
      doc.setLineWidth(0.5)
      doc.line(margin, fy, pageWidth - margin, fy)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...BRAND.muted)
      doc.text('Promadera · Ecosistema digital de la construcción en madera', margin, fy + 18)
      doc.text('promadera.com.ar', margin, fy + 32)

      doc.setTextColor(...BRAND.primary)
      doc.setFont('helvetica', 'bold')
      doc.text(`Página ${pageNum} / ${pageCount}`, pageWidth - margin, fy + 32, { align: 'right' })
    }

    const ensureSpace = (h: number) => {
      if (y + h > contentBottom) {
        doc.addPage()
        y = contentTop
        drawHeader()
      }
    }

    const writeHeading = (text: string, size = 13) => {
      ensureSpace(size + 22)
      doc.setFillColor(...BRAND.primary)
      doc.rect(margin, y - 1, 3, size + 4, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(size)
      doc.setTextColor(...BRAND.primaryDark)
      doc.text(text.toUpperCase(), margin + 10, y + size - 2)
      y += size + 10
      doc.setDrawColor(...BRAND.rule)
      doc.setLineWidth(0.5)
      doc.line(margin, y - 2, pageWidth - margin, y - 2)
      y += 6
    }

    const writeParagraph = (text: string, size = 10.5) => {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(size)
      doc.setTextColor(...BRAND.ink)
      const lines = doc.splitTextToSize(text, maxWidth)
      lines.forEach((line: string) => {
        ensureSpace(size + 4)
        doc.text(line, margin, y)
        y += size + 4
      })
      y += 6
    }

    const writeList = (items: string[], size = 10.5) => {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(size)
      doc.setTextColor(...BRAND.ink)
      items.forEach((item) => {
        const lines = doc.splitTextToSize(item, maxWidth - 16)
        lines.forEach((line: string, idx: number) => {
          ensureSpace(size + 4)
          if (idx === 0) {
            doc.setFillColor(...BRAND.primary)
            doc.circle(margin + 4, y - 3, 1.6, 'F')
          }
          doc.text(line, margin + 14, y)
          y += size + 4
        })
      })
      y += 6
    }

    const writeKeyValue = (rows: [string, string][]) => {
      const labelW = 110
      const size = 10.5
      doc.setFontSize(size)
      rows.forEach(([k, v]) => {
        const lines = doc.splitTextToSize(v, maxWidth - labelW)
        ensureSpace(Math.max(size + 6, lines.length * (size + 3) + 4))
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...BRAND.primaryDark)
        doc.text(k, margin, y)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...BRAND.ink)
        lines.forEach((line: string, i: number) => {
          doc.text(line, margin + labelW, y + i * (size + 3))
        })
        y += Math.max(size + 6, lines.length * (size + 3) + 4)
      })
      y += 4
    }

    drawHeader()

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.setTextColor(...BRAND.primaryDark)
    doc.text('Brief de proyecto', margin, y + 6)
    y += 28
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...BRAND.muted)
    doc.text(`Generado el ${new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, y)
    y += 22

    writeHeading('Datos del proyecto')
    writeKeyValue([
      ['Tipo', form.tipo === 'vivienda' ? 'Vivienda nueva en madera' : 'Construcción exterior'],
      ['Subtipo', subtipoLabel || '—'],
      ['Superficie', form.superficie || '—'],
      ['Ubicación', form.ubicacion || '—'],
      ['Plazo', form.plazo || '—'],
      ['Presupuesto', form.presupuesto || '—'],
      ['Terminaciones', form.terminaciones.length ? form.terminaciones.join(', ') : '—'],
    ])
    if (form.notas.trim()) {
      writeHeading('Notas del solicitante')
      writeParagraph(form.notas)
    }

    writeHeading('Resumen del proyecto')
    writeParagraph(brief.resumen)

    if (brief.estimaciones?.length) {
      writeHeading('Estimaciones técnicas')
      writeList(brief.estimaciones)
    }
    if (brief.siguientes_pasos?.length) {
      writeHeading('Próximos pasos')
      writeList(brief.siguientes_pasos)
    }
    if (brief.rubros?.length) {
      writeHeading('Rubros sugeridos')
      writeParagraph(brief.rubros.join(' · '))
    }
    if (brief.descripcion_para_proveedor) {
      writeHeading('Descripción para el proveedor')
      writeParagraph(brief.descripcion_para_proveedor)
    }

    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      drawFooter(i, pageCount)
    }

    return doc
  }

  const downloadPDF = () => {
    const doc = buildPDF()
    if (!doc) return
    doc.save(`${fileSlug()}.pdf`)
    toast.success('Brief descargado en PDF')
  }

  const openPreview = () => {
    if (!form.brief || buildingPreview) return
    setBuildingPreview(true)
    try {
      const doc = buildPDF()
      if (!doc) return
      const blob = doc.output('blob')
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(blob))
    } catch {
      toast.error('No pudimos generar la vista previa')
    } finally {
      setBuildingPreview(false)
    }
  }

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  const send = () => {
    if (!loggedIn) {
      goAuth()
      return
    }
    if (!form.brief || selectedEmpresas.length === 0) return
    setSending(true)
    startTransition(async () => {
      const descripcion = form.brief!.descripcion_para_proveedor || form.brief!.resumen
      const res = await enviarCotizaciones({
        empresaIds: selectedEmpresas,
        draftId,
        referencia: subtipoLabel,
        descripcion,
        cantidad: form.superficie,
        plazo: form.plazo,
        ubicacion: form.ubicacion,
        presupuesto: form.presupuesto,
      })
      setSending(false)
      if (!res.ok) {
        toast.error(res.error ?? 'No pudimos enviar las solicitudes')
        return
      }
      toast.success(`Enviamos tu proyecto a ${selectedEmpresas.length} proveedor(es)`)
      try {
        downloadPDF()
      } catch {
        /* no bloquea el envío */
      }
      closePreview()
      router.push('/mis-cotizaciones')
    })
  }

  return (
    <>
      {refProyecto && step < 3 && (
        <div className="mb-8 flex flex-col items-start gap-4 border border-primary/30 bg-primary/5 p-5 sm:flex-row">
          {refProyecto.imagen && (
            <Image
              src={refProyecto.imagen}
              alt={refProyecto.titulo}
              width={128}
              height={96}
              className="h-24 w-full shrink-0 object-cover sm:w-32"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-eyebrow mb-1 text-primary">Proyecto de referencia</p>
            <h2 className="mb-1 font-display text-lg leading-tight">{refProyecto.titulo}</h2>
            <p className="text-sm text-muted-foreground">
              {[refProyecto.categoria, refProyecto.ubicacion, refProyecto.anio, refProyecto.sistemaConstructivo]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Prellenamos tipo, ubicación y notas. Podés editarlos en los próximos pasos.
            </p>
          </div>
          <Link href={`/proyectos/${refProyecto.slug}`} className="shrink-0 text-xs uppercase tracking-[0.14em] text-primary hover:underline">
            Ver detalle
          </Link>
        </div>
      )}

      {loggedIn && drafts.length > 0 && (
        <div className="mb-8 border border-border bg-muted/30 p-5">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tus borradores</h2>
          </div>
          <ul className="divide-y divide-border">
            {drafts.slice(0, 5).map((d) => {
              const isCurrent = d.id === draftId
              return (
                <li key={d.id} className="flex items-center gap-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {d.titulo || 'Borrador'}
                      {isCurrent && (
                        <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-primary">en edición</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Paso {Math.min(d.wizardStep + 1, STEPS.length)} de {STEPS.length} ·{' '}
                      {new Date(d.updatedAt).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {d.refSlug ? ` · ref: ${d.refSlug}` : ''}
                    </div>
                  </div>
                  {!isCurrent && (
                    <Button size="sm" variant="outline" onClick={() => applyDraft(d)} disabled={pending}>
                      Retomar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteDraft(d.id)}
                    aria-label="Eliminar borrador"
                    disabled={pending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="mb-10 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-medium',
                i < step
                  ? 'bg-primary text-primary-foreground'
                  : i === step
                    ? 'border border-primary bg-primary/15 text-primary'
                    : 'bg-muted text-muted-foreground',
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('hidden text-xs uppercase tracking-[0.14em] md:inline', i === step ? 'text-foreground' : 'text-muted-foreground')}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className={cn('h-px flex-1', i < step ? 'bg-primary' : 'bg-border')} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {(['vivienda', 'exterior'] as Tipo[]).map((t) => {
              const Icon = t === 'vivienda' ? Home : Trees
              const active = form.tipo === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    set('tipo', t)
                    set('subtipo', '')
                  }}
                  className={cn('border p-6 text-left transition-all', active ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40')}
                >
                  <Icon className={cn('mb-3 h-7 w-7', active ? 'text-primary' : 'text-muted-foreground')} />
                  <div className="mb-1 font-display text-xl">{t === 'vivienda' ? 'Vivienda nueva en madera' : 'Construcción exterior'}</div>
                  <p className="text-sm text-muted-foreground">
                    {t === 'vivienda' ? 'Casas, cabañas, módulos prefabricados o ampliaciones.' : 'Decks, pérgolas, quinchos y obras chicas al aire libre.'}
                  </p>
                </button>
              )
            })}
          </div>

          {form.tipo && (
            <div>
              <Label className="mb-3 block">Elegí el subtipo</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {SUBTIPOS[form.tipo].map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => set('subtipo', s.value)}
                    className={cn('border p-4 text-left transition-colors', form.subtipo === s.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40')}
                  >
                    <div className="font-medium">{s.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="superficie">Superficie aproximada *</Label>
              <Input
                id="superficie"
                value={form.superficie}
                onChange={(e) => set('superficie', e.target.value)}
                placeholder={form.tipo === 'vivienda' ? 'Ej.: 80 m²' : 'Ej.: 25 m²'}
                maxLength={60}
              />
            </div>
            <div>
              <Label htmlFor="ubicacion">Ubicación de la obra *</Label>
              <Input
                id="ubicacion"
                value={form.ubicacion}
                onChange={(e) => set('ubicacion', e.target.value)}
                placeholder="Ej.: Corrientes Capital"
                maxLength={120}
              />
            </div>
            <div>
              <Label htmlFor="plazo">Plazo deseado</Label>
              <Input id="plazo" value={form.plazo} onChange={(e) => set('plazo', e.target.value)} placeholder="Ej.: 4 meses" maxLength={60} />
            </div>
            <div>
              <Label htmlFor="presupuesto">Presupuesto estimado</Label>
              <Input id="presupuesto" value={form.presupuesto} onChange={(e) => set('presupuesto', e.target.value)} placeholder="Opcional" maxLength={60} />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Terminaciones e instalaciones</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {TERMINACIONES.map((t) => {
                const active = form.terminaciones.includes(t)
                return (
                  <label key={t} className={cn('flex cursor-pointer items-center gap-3 border p-3 transition-colors', active ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40')}>
                    <Checkbox checked={active} onCheckedChange={() => toggleTerm(t)} />
                    <span className="text-sm">{t}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="notas">Algo más que quieras contarnos (opcional)</Label>
            <Textarea id="notas" value={form.notas} onChange={(e) => set('notas', e.target.value)} placeholder="Estilo, requerimientos especiales, terreno, etc." rows={3} maxLength={500} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="border border-border bg-muted/30 p-6">
            <div className="mb-3 flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <h2 className="font-display text-lg">Asistente IA</h2>
                <p className="text-sm text-muted-foreground">
                  Generamos un resumen técnico de tu proyecto y sugerimos qué tipo de proveedores te pueden cotizar.
                </p>
              </div>
            </div>
            {!form.brief && (
              <Button onClick={generateBrief} disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando brief...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generar brief con IA
                  </>
                )}
              </Button>
            )}
          </div>

          {form.brief && (
            <div className="space-y-5">
              <section className="border border-border p-6">
                <h3 className="mb-2 font-display text-lg">Resumen del proyecto</h3>
                <p className="leading-relaxed text-foreground/85">{form.brief.resumen}</p>
              </section>

              {form.brief.estimaciones?.length > 0 && (
                <section className="border border-border p-6">
                  <h3 className="mb-3 font-display text-lg">Estimaciones técnicas</h3>
                  <ul className="list-disc space-y-1.5 pl-5 text-foreground/85">
                    {form.brief.estimaciones.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </section>
              )}

              {form.brief.siguientes_pasos?.length > 0 && (
                <section className="border border-border p-6">
                  <h3 className="mb-3 font-display text-lg">Próximos pasos</h3>
                  <ul className="list-disc space-y-1.5 pl-5 text-foreground/85">
                    {form.brief.siguientes_pasos.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </section>
              )}

              {form.brief.rubros?.length > 0 && (
                <section className="border border-border p-6">
                  <h3 className="mb-3 font-display text-lg">Rubros sugeridos</h3>
                  <div className="flex flex-wrap gap-2">
                    {form.brief.rubros.map((r) => (
                      <Badge key={r} variant="secondary" className="capitalize">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={generateBrief} disabled={generating}>
                  {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Regenerar
                </Button>
                <Button variant="outline" onClick={openPreview} disabled={buildingPreview}>
                  {buildingPreview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                  Vista previa del PDF
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          {!loggedIn && (
            <div className="flex items-start gap-3 border border-primary/30 bg-primary/5 p-4">
              <LogIn className="mt-0.5 h-5 w-5 text-primary" />
              <div className="flex-1 text-sm">
                Para enviar tu proyecto a los proveedores necesitás{' '}
                <button type="button" onClick={() => goAuth()} className="font-medium underline">
                  iniciar sesión
                </button>
                .
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="mb-1 font-display text-xl">Proveedores sugeridos</h2>
              <p className="text-sm text-muted-foreground">Elegí a quiénes querés enviarles tu proyecto. Reciben el mismo brief en paralelo.</p>
            </div>
            <Button variant="outline" size="sm" onClick={openPreview} disabled={!form.brief || buildingPreview}>
              {buildingPreview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
              Vista previa del PDF
            </Button>
          </div>

          {loadingEmpresas ? (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="mr-2 inline h-5 w-5 animate-spin" /> Buscando proveedores...
            </div>
          ) : empresas.length === 0 ? (
            <div className="border border-dashed border-border py-12 text-center text-muted-foreground">
              No encontramos proveedores que coincidan. Probá editar el brief.
            </div>
          ) : (
            <div className="grid gap-3">
              {empresas.map((e) => {
                const active = selectedEmpresas.includes(e.id)
                return (
                  <label key={e.id} className={cn('flex cursor-pointer items-start gap-4 border p-4 transition-colors', active ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40')}>
                    <Checkbox
                      checked={active}
                      onCheckedChange={() => setSelectedEmpresas((arr) => (arr.includes(e.id) ? arr.filter((x) => x !== e.id) : [...arr, e.id]))}
                    />
                    <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden bg-muted">
                      {e.logoUrl ? (
                        <img src={e.logoUrl} alt={e.nombre} className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{e.nombre}</div>
                      <div className="text-xs text-muted-foreground">{[e.sector, e.ubicacion].filter(Boolean).join(' · ')}</div>
                      {e.servicios.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {e.servicios.slice(0, 4).map((s) => (
                            <span key={s} className="border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || sending}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
        </Button>
        <div className="ml-auto flex items-center gap-2">
          {step < STEPS.length - 1 && (
            <Button variant="outline" onClick={saveDraft} disabled={savingDraft || sending}>
              {savingDraft ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {draftId ? 'Actualizar borrador' : 'Guardar borrador'}
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => {
                if (step === 1 && !form.brief) {
                  goToStep(2)
                  return
                }
                goToStep(step + 1)
              }}
              disabled={!canNext()}
            >
              Continuar <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={send} disabled={sending || selectedEmpresas.length === 0 || !form.brief}>
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Enviar a {selectedEmpresas.length} proveedor{selectedEmpresas.length === 1 ? '' : 'es'} y descargar
            </Button>
          )}
        </div>
      </div>

      <Dialog open={!!previewUrl} onOpenChange={(o) => !o && closePreview()}>
        <DialogContent className="flex h-[90vh] w-[95vw] max-w-5xl flex-col gap-0 p-0">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle>Vista previa del brief</DialogTitle>
            <DialogDescription>Revisá el contenido antes de descargar o enviar.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-muted/40">
            {previewUrl && <iframe src={previewUrl} title="Vista previa del brief en PDF" className="h-full w-full border-0" />}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4">
            <p className="text-xs text-muted-foreground">Al enviar la solicitud también se descargará automáticamente esta copia.</p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={closePreview}>
                <X className="mr-2 h-4 w-4" /> Cerrar
              </Button>
              <Button variant="outline" onClick={downloadPDF}>
                <Download className="mr-2 h-4 w-4" /> Descargar PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
