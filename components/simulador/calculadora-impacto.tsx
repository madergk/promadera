'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowRight, Check, Leaf, Link2, Share2, Timer, Wallet } from 'lucide-react'

import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FadeIn } from '@/components/shared/fade-in'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'

type SistemaKey = 'frame' | 'clt' | 'mixto'

interface Sistema {
  key: SistemaKey
  label: string
  description: string
  /** m³ de madera estructural por m² construido */
  maderaPorM2: number
  /** ahorro de costo directo respecto de la construcción tradicional húmeda */
  ahorroCosto: number
  /** factor de plazo de obra respecto de la construcción tradicional */
  factorPlazo: number
}

const sistemas: Sistema[] = [
  {
    key: 'frame',
    label: 'Wood Frame',
    description:
      'Entramado liviano industrializado, ideal para vivienda y equipamiento de baja altura.',
    maderaPorM2: 0.12,
    ahorroCosto: 0.14,
    factorPlazo: 0.45,
  },
  {
    key: 'clt',
    label: 'CLT / Glulam',
    description:
      'Madera maciza laminada para media altura, grandes luces y edificios institucionales.',
    maderaPorM2: 0.3,
    ahorroCosto: 0.07,
    factorPlazo: 0.4,
  },
  {
    key: 'mixto',
    label: 'Sistema mixto',
    description: 'Combinación de madera con hormigón o acero en núcleos, fundaciones y entrepisos.',
    maderaPorM2: 0.2,
    ahorroCosto: 0.1,
    factorPlazo: 0.6,
  },
]

/** tCO₂e almacenadas por m³ de madera estructural (≈0,5 tC/m³ · 44/12) */
const CO2_POR_M3 = 0.9
/** tCO₂e emitidas por m² en construcción tradicional húmeda */
const CO2_TRADICIONAL_M2 = 0.35
/** tCO₂e emitidas por m² en construcción industrializada en madera */
const CO2_MADERA_M2 = 0.12
/** días de obra por m² en construcción tradicional, más puesta en marcha */
const DIAS_TRADICIONAL_M2 = 0.85
const DIAS_BASE = 45

const nf = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 })

function calcular(sistema: Sistema, superficie: number, costoM2: number) {
  const m3 = superficie * sistema.maderaPorM2
  const carbonoAlmacenado = m3 * CO2_POR_M3
  const emisionesEvitadas = superficie * (CO2_TRADICIONAL_M2 - CO2_MADERA_M2)
  const impactoTotal = carbonoAlmacenado + emisionesEvitadas

  const costoTradicional = superficie * costoM2
  const ahorro = costoTradicional * sistema.ahorroCosto

  const diasTradicional = DIAS_BASE + superficie * DIAS_TRADICIONAL_M2
  const diasMadera = DIAS_BASE * 0.7 + superficie * DIAS_TRADICIONAL_M2 * sistema.factorPlazo
  const diasAhorrados = diasTradicional - diasMadera

  return {
    m3,
    carbonoAlmacenado,
    emisionesEvitadas,
    impactoTotal,
    autos: impactoTotal / 2.4,
    costoTradicional,
    ahorro,
    costoMadera: costoTradicional - ahorro,
    diasTradicional,
    diasMadera,
    diasAhorrados,
    mesesAhorrados: diasAhorrados / 30,
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function CalculadoraImpacto() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [superficie, setSuperficie] = useState(() => {
    const v = Number(searchParams.get('m2'))
    return Number.isFinite(v) && v > 0 ? clamp(Math.round(v / 10) * 10, 40, 5000) : 250
  })
  const [costoM2, setCostoM2] = useState(() => {
    const v = Number(searchParams.get('costo'))
    return Number.isFinite(v) && v > 0 ? clamp(Math.round(v / 25) * 25, 400, 2500) : 900
  })
  const [sistemaKey, setSistemaKey] = useState<SistemaKey>(() => {
    const v = searchParams.get('sistema')
    return sistemas.some((s) => s.key === v) ? (v as SistemaKey) : 'frame'
  })

  const sistema = sistemas.find((s) => s.key === sistemaKey)!

  const r = useMemo(() => calcular(sistema, superficie, costoM2), [superficie, costoM2, sistema])

  const comparacion = useMemo(
    () => sistemas.map((s) => ({ sistema: s, resultado: calcular(s, superficie, costoM2) })),
    [superficie, costoM2],
  )

  const mejor = useMemo(
    () => ({
      carbono: Math.max(...comparacion.map((c) => c.resultado.impactoTotal)),
      ahorro: Math.max(...comparacion.map((c) => c.resultado.ahorro)),
      plazo: Math.min(...comparacion.map((c) => c.resultado.diasMadera)),
    }),
    [comparacion],
  )

  // Mantener la URL sincronizada para poder compartir el escenario exacto
  useEffect(() => {
    const params = new URLSearchParams({
      m2: String(superficie),
      costo: String(costoM2),
      sistema: sistemaKey,
    })
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [superficie, costoM2, sistemaKey])

  const resumen = `Simulación en madera (${sistema.label}, ${nf.format(superficie)} m²): ${nf1.format(
    r.impactoTotal,
  )} tCO₂e de impacto, US$ ${nf.format(r.ahorro)} de ahorro y ${nf1.format(
    r.mesesAhorrados,
  )} meses menos de obra.`

  const eventoBase = useCallback(
    () => ({
      sistema: sistemaKey,
      superficie_m2: superficie,
      costo_m2: costoM2,
      ahorro_usd: Math.round(r.ahorro),
      impacto_tco2e: Number(r.impactoTotal.toFixed(1)),
    }),
    [sistemaKey, superficie, costoM2, r.ahorro, r.impactoTotal],
  )

  const copiarEnlace = async (texto?: string, origen: string = 'boton_copiar') => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      await navigator.clipboard.writeText(texto ? `${texto} ${url}` : url)
      trackEvent('simulador_copiar_enlace', { ...eventoBase(), origen, resultado: 'exito' })
      toast.success('Enlace copiado.')
    } catch {
      trackEvent('simulador_copiar_enlace', { ...eventoBase(), origen, resultado: 'error' })
      toast.error('No pudimos copiar el enlace.')
    }
  }

  const compartir = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const puedeCompartir = typeof navigator !== 'undefined' && !!navigator.share
    trackEvent('simulador_compartir_click', {
      ...eventoBase(),
      metodo: puedeCompartir ? 'web_share' : 'clipboard',
    })
    if (puedeCompartir) {
      try {
        await navigator.share({ title: 'Simulá tu proyecto en madera', text: resumen, url })
        trackEvent('simulador_compartir', { ...eventoBase(), metodo: 'web_share', resultado: 'exito' })
        return
      } catch (e) {
        if ((e as DOMException)?.name === 'AbortError') {
          trackEvent('simulador_compartir', {
            ...eventoBase(),
            metodo: 'web_share',
            resultado: 'cancelado',
          })
          return
        }
      }
    }
    await copiarEnlace(resumen, 'compartir_fallback')
  }

  return (
    <>
      <section className="section">
        <div className="container-wide grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Controles */}
          <div className="lg:col-span-5">
            <FadeIn>
              <div className="space-y-10 border border-border p-6 md:p-8">
                <div>
                  <p className="text-eyebrow mb-6 text-primary">Parámetros del proyecto</p>

                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <Label htmlFor="superficie" className="text-sm text-foreground">
                        Superficie a construir
                      </Label>
                      <span className="font-display text-lg text-foreground">
                        {nf.format(superficie)} m²
                      </span>
                    </div>
                    <Slider
                      id="superficie"
                      value={[superficie]}
                      onValueChange={(v) => setSuperficie(v[0])}
                      min={40}
                      max={5000}
                      step={10}
                      aria-label="Superficie a construir en metros cuadrados"
                    />
                    <p className="text-xs text-muted-foreground">De 40 a 5.000 m².</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <Label htmlFor="costo" className="text-sm text-foreground">
                      Costo tradicional de referencia
                    </Label>
                    <span className="font-display text-lg text-foreground">
                      US$ {nf.format(costoM2)}/m²
                    </span>
                  </div>
                  <Slider
                    id="costo"
                    value={[costoM2]}
                    onValueChange={(v) => setCostoM2(v[0])}
                    min={400}
                    max={2500}
                    step={25}
                    aria-label="Costo por metro cuadrado de construcción tradicional"
                  />
                  <p className="text-xs text-muted-foreground">
                    Valor de obra húmeda comparable en tu región.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-foreground">Sistema constructivo</p>
                  <div className="grid gap-px border border-border bg-border">
                    {sistemas.map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setSistemaKey(s.key)}
                        aria-pressed={sistemaKey === s.key}
                        className={cn(
                          'bg-background p-4 text-left transition-colors',
                          sistemaKey === s.key
                            ? 'bg-secondary text-secondary-foreground'
                            : 'hover:bg-muted',
                        )}
                      >
                        <span
                          className={cn(
                            'block font-display text-base',
                            sistemaKey === s.key ? 'text-secondary-foreground' : 'text-foreground',
                          )}
                        >
                          {s.label}
                        </span>
                        <span
                          className={cn(
                            'mt-1 block text-xs leading-relaxed',
                            sistemaKey === s.key
                              ? 'text-secondary-foreground/80'
                              : 'text-muted-foreground',
                          )}
                        >
                          {s.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Resultados */}
          <div className="space-y-px lg:col-span-7">
            <FadeIn delay={0.05}>
              <article className="border border-border p-6 md:p-8">
                <div className="mb-5 flex items-center gap-3">
                  <Leaf className="h-4 w-4 text-accent" />
                  <p className="text-eyebrow text-muted-foreground">Captura de carbono</p>
                </div>
                <p className="font-display text-4xl text-foreground md:text-5xl">
                  {nf1.format(r.impactoTotal)} tCO₂e
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {nf1.format(r.carbonoAlmacenado)} t almacenadas en {nf1.format(r.m3)} m³ de madera
                  y {nf1.format(r.emisionesEvitadas)} t evitadas frente a la obra tradicional.
                  Equivale a sacar de circulación unos {nf.format(r.autos)} autos durante un año.
                </p>
              </article>
            </FadeIn>

            <FadeIn delay={0.1}>
              <article className="border border-border p-6 md:p-8">
                <div className="mb-5 flex items-center gap-3">
                  <Wallet className="h-4 w-4 text-accent" />
                  <p className="text-eyebrow text-muted-foreground">Ahorro de costos</p>
                </div>
                <p className="font-display text-4xl text-foreground md:text-5xl">
                  US$ {nf.format(r.ahorro)}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Obra tradicional estimada en US$ {nf.format(r.costoTradicional)} frente a US${' '}
                  {nf.format(r.costoMadera)} con {sistema.label.toLowerCase()} (
                  {nf.format(sistema.ahorroCosto * 100)}% de ahorro directo, sin contar el menor
                  costo financiero del plazo).
                </p>
              </article>
            </FadeIn>

            <FadeIn delay={0.15}>
              <article className="border border-border p-6 md:p-8">
                <div className="mb-5 flex items-center gap-3">
                  <Timer className="h-4 w-4 text-accent" />
                  <p className="text-eyebrow text-muted-foreground">Rapidez constructiva</p>
                </div>
                <p className="font-display text-4xl text-foreground md:text-5xl">
                  {nf1.format(r.mesesAhorrados)} meses menos
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {nf.format(r.diasMadera)} días de obra estimados con madera industrializada frente
                  a {nf.format(r.diasTradicional)} días del sistema tradicional.
                </p>
              </article>
            </FadeIn>

            <FadeIn delay={0.18}>
              <article className="border border-border p-6 md:p-8">
                <div className="mb-5 flex items-center gap-3">
                  <Share2 className="h-4 w-4 text-accent" />
                  <p className="text-eyebrow text-muted-foreground">Compartir resultados</p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{resumen}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button type="button" variant="outline" onClick={compartir}>
                    <Share2 className="h-4 w-4" /> Compartir
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => copiarEnlace()}>
                    <Link2 className="h-4 w-4" /> Copiar enlace
                  </Button>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  El enlace conserva superficie, costo de referencia y sistema elegido.
                </p>
              </article>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="border border-border bg-secondary p-6 md:p-8">
                <p className="text-sm leading-relaxed text-secondary-foreground">
                  ¿Querés llevar esta estimación a un proyecto concreto? Armá tu obra con la guía
                  asistida y pedí cotizaciones a empresas del directorio.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href="/guia-proyecto">
                      Armar mi proyecto <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/proveedores">Ver directorio</Link>
                  </Button>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.25}>
              <p className="pt-8 text-xs leading-relaxed text-muted-foreground">
                Metodología: se consideran 0,9 tCO₂e almacenadas por m³ de madera estructural y una
                diferencia de 0,23 tCO₂e/m² entre construcción tradicional húmeda e industrializada
                en madera. Los valores son estimaciones orientativas para exploración temprana y no
                reemplazan un análisis de ciclo de vida ni un cómputo y presupuesto profesional.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Comparación de sistemas */}
      <section className="section border-t border-border bg-muted/30">
        <div className="container-wide">
          <FadeIn>
            <div className="max-w-2xl">
              <p className="text-eyebrow mb-4 text-primary">Comparar sistemas</p>
              <h2 className="text-balance font-display text-3xl text-foreground md:text-4xl lg:text-5xl">
                Los tres sistemas, con los mismos parámetros.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Resultados para {nf.format(superficie)} m² y un costo tradicional de referencia de
                US$ {nf.format(costoM2)}/m². Ajustá los parámetros arriba y la comparación se
                actualiza.
              </p>
            </div>
          </FadeIn>

          {/* Tabla comparativa (desktop) */}
          <FadeIn delay={0.05}>
            <div className="mt-12 hidden overflow-x-auto md:block">
              <table className="w-full border border-border bg-background text-left">
                <caption className="sr-only">
                  Comparación de captura de carbono, costos y plazos entre sistemas constructivos
                </caption>
                <thead>
                  <tr className="border-b border-border">
                    <th
                      scope="col"
                      className="p-5 text-xs font-normal uppercase tracking-[0.2em] text-muted-foreground"
                    >
                      Indicador
                    </th>
                    {comparacion.map(({ sistema: s }) => (
                      <th key={s.key} scope="col" className="p-5">
                        <button
                          type="button"
                          onClick={() => setSistemaKey(s.key)}
                          aria-pressed={sistemaKey === s.key}
                          className={cn(
                            'text-left font-display text-lg transition-colors',
                            sistemaKey === s.key
                              ? 'text-primary'
                              : 'text-foreground hover:text-primary',
                          )}
                        >
                          {s.label}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {(
                    [
                      {
                        label: 'Impacto de carbono',
                        hint: 'Almacenado + evitado',
                        value: (c: (typeof comparacion)[number]) =>
                          `${nf1.format(c.resultado.impactoTotal)} tCO₂e`,
                        best: (c: (typeof comparacion)[number]) =>
                          c.resultado.impactoTotal === mejor.carbono,
                      },
                      {
                        label: 'Madera estructural',
                        hint: 'Volumen estimado',
                        value: (c: (typeof comparacion)[number]) => `${nf1.format(c.resultado.m3)} m³`,
                      },
                      {
                        label: 'Costo estimado de obra',
                        hint: 'Tradicional: US$ ' + nf.format(comparacion[0].resultado.costoTradicional),
                        value: (c: (typeof comparacion)[number]) =>
                          `US$ ${nf.format(c.resultado.costoMadera)}`,
                      },
                      {
                        label: 'Ahorro de costos',
                        hint: 'Sobre obra tradicional',
                        value: (c: (typeof comparacion)[number]) =>
                          `US$ ${nf.format(c.resultado.ahorro)} (${nf.format(c.sistema.ahorroCosto * 100)}%)`,
                        best: (c: (typeof comparacion)[number]) => c.resultado.ahorro === mejor.ahorro,
                      },
                      {
                        label: 'Plazo de obra',
                        hint: 'Tradicional: ' + nf.format(comparacion[0].resultado.diasTradicional) + ' días',
                        value: (c: (typeof comparacion)[number]) => `${nf.format(c.resultado.diasMadera)} días`,
                        best: (c: (typeof comparacion)[number]) => c.resultado.diasMadera === mejor.plazo,
                      },
                      {
                        label: 'Tiempo ahorrado',
                        hint: 'Respecto de obra húmeda',
                        value: (c: (typeof comparacion)[number]) =>
                          `${nf1.format(c.resultado.mesesAhorrados)} meses`,
                        best: (c: (typeof comparacion)[number]) => c.resultado.diasMadera === mejor.plazo,
                      },
                    ] as const
                  ).map((row) => (
                    <tr key={row.label} className="border-b border-border last:border-b-0">
                      <th scope="row" className="p-5 align-top font-normal">
                        <span className="block text-foreground">{row.label}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{row.hint}</span>
                      </th>
                      {comparacion.map((c) => {
                        const destacado = 'best' in row ? row.best(c) : false
                        return (
                          <td
                            key={c.sistema.key}
                            className={cn(
                              'p-5 align-top',
                              sistemaKey === c.sistema.key && 'bg-muted/60',
                              destacado ? 'font-medium text-primary' : 'text-foreground',
                            )}
                          >
                            <span className="flex items-center gap-2">
                              {row.value(c)}
                              {destacado && <Check className="h-3.5 w-3.5 shrink-0" aria-label="Mejor resultado" />}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          {/* Tarjetas comparativas (mobile) */}
          <div className="mt-10 grid gap-px border border-border bg-border md:hidden">
            {comparacion.map(({ sistema: s, resultado }) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSistemaKey(s.key)}
                aria-pressed={sistemaKey === s.key}
                className={cn('bg-background p-6 text-left', sistemaKey === s.key && 'bg-muted/60')}
              >
                <p
                  className={cn(
                    'font-display text-xl',
                    sistemaKey === s.key ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {s.label}
                </p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Impacto de carbono</dt>
                    <dd
                      className={cn(
                        resultado.impactoTotal === mejor.carbono
                          ? 'font-medium text-primary'
                          : 'text-foreground',
                      )}
                    >
                      {nf1.format(resultado.impactoTotal)} tCO₂e
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Costo de obra</dt>
                    <dd className="text-foreground">US$ {nf.format(resultado.costoMadera)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Ahorro</dt>
                    <dd
                      className={cn(
                        resultado.ahorro === mejor.ahorro ? 'font-medium text-primary' : 'text-foreground',
                      )}
                    >
                      US$ {nf.format(resultado.ahorro)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Plazo de obra</dt>
                    <dd
                      className={cn(
                        resultado.diasMadera === mejor.plazo ? 'font-medium text-primary' : 'text-foreground',
                      )}
                    >
                      {nf.format(resultado.diasMadera)} días
                    </dd>
                  </div>
                </dl>
              </button>
            ))}
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Los valores marcados indican el mejor resultado de cada indicador entre los tres
            sistemas. Tocá un sistema para verlo en detalle en la calculadora.
          </p>
        </div>
      </section>
    </>
  )
}
