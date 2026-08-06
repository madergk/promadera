'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FadeIn } from '@/components/shared/fade-in'
import { cn } from '@/lib/utils'

const cats = ['Todos', 'Vivienda', 'Comercial', 'Institucional', 'Industrial', 'Turismo'] as const
type Cat = (typeof cats)[number]

const FALLBACK_COVER = '/assets/wood-architecture.jpg'

export interface ProyectoCard {
  slug: string
  titulo: string
  resumen: string | null
  categoria: string | null
  ubicacion: string | null
  anio: number | null
  imagen: string | null
  sistemaConstructivo: string | null
  constructora: string | null
}

export function ListadoProyectos({ proyectos }: { proyectos: ProyectoCard[] }) {
  const [filter, setFilter] = useState<Cat>('Todos')
  const [sistema, setSistema] = useState('Todos')
  const [q, setQ] = useState('')

  const sistemas = useMemo(
    () => [
      'Todos',
      ...Array.from(
        new Set(proyectos.map((p) => p.sistemaConstructivo).filter(Boolean) as string[]),
      ),
    ],
    [proyectos],
  )

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return proyectos.filter((p) => {
      if (filter !== 'Todos' && p.categoria !== filter) return false
      if (sistema !== 'Todos' && p.sistemaConstructivo !== sistema) return false
      if (!term) return true
      return [p.titulo, p.ubicacion, p.constructora, p.resumen]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(term))
    })
  }, [proyectos, filter, sistema, q])

  const destacados = proyectos.slice(0, 3)
  const sinFiltros = filter === 'Todos' && sistema === 'Todos' && !q.trim()

  return (
    <>
      {destacados.length > 0 && (
        <section className="section-sm">
          <div className="container-wide">
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <p className="text-eyebrow mb-3 text-primary">Destacados</p>
                <h2 className="font-display text-2xl text-foreground md:text-3xl">
                  Obras recientes de la red.
                </h2>
              </div>
            </div>
            <div className="grid gap-px bg-border lg:grid-cols-3">
              {destacados.map((p, idx) => (
                <FadeIn key={p.slug} delay={idx * 0.06}>
                  <Link
                    href={`/proyectos/${p.slug}`}
                    className="group relative block h-full min-h-[320px] overflow-hidden bg-background"
                  >
                    <Image
                      src={p.imagen || FALLBACK_COVER}
                      alt={p.titulo}
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover transition-transform duration-[1.4s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
                    <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-8">
                      <div className="text-eyebrow mb-3 flex items-center gap-3 text-on-media/80">
                        <span>{p.categoria}</span>
                        {p.anio && (
                          <>
                            <span className="text-on-media/40">·</span>
                            <span>{p.anio}</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-display text-xl leading-snug text-on-media md:text-2xl">
                        {p.titulo}
                      </h3>
                      {p.ubicacion && (
                        <p className="mt-3 flex items-center gap-2 text-xs text-on-media/70">
                          <MapPin className="h-3 w-3" />
                          {p.ubicacion}
                        </p>
                      )}
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-sm md:section">
        <div className="container-wide">
          <div className="mb-12 space-y-5 border-b border-border pb-8">
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={cn(
                    'border px-5 py-2.5 text-xs uppercase tracking-[0.2em] transition-colors',
                    filter === c
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-foreground hover:border-primary',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {sistemas.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {sistemas.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSistema(s)}
                      className={cn(
                        'border px-3.5 py-2 text-xs transition-colors',
                        sistema === s
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar obra, lugar o constructora"
                  className="pl-9"
                />
              </div>
            </div>

            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {list.length} {list.length === 1 ? 'proyecto' : 'proyectos'}
              {!sinFiltros && ' · filtrados'}
            </p>
          </div>

          {list.length === 0 ? (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>No hay proyectos con estos filtros.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setFilter('Todos')
                  setSistema('Todos')
                  setQ('')
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {list.map((p, idx) => (
                <FadeIn key={p.slug} delay={(idx % 6) * 0.06}>
                  <Link href={`/proyectos/${p.slug}`} className="group block overflow-hidden">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={p.imagen || FALLBACK_COVER}
                        alt={p.titulo}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-[1.4s] group-hover:scale-105"
                      />
                    </div>
                    <div className="bg-surface/80 p-6">
                      <div className="text-eyebrow mb-3 flex items-center gap-3 text-primary">
                        <span>{p.categoria}</span>
                        {p.anio && (
                          <>
                            <span className="text-border">·</span>
                            <span className="text-muted-foreground">{p.anio}</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-display text-xl leading-snug text-foreground transition-colors group-hover:text-accent md:text-2xl">
                        {p.titulo}
                      </h3>
                      {p.sistemaConstructivo && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {p.sistemaConstructivo}
                        </p>
                      )}
                      {p.ubicacion && (
                        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {p.ubicacion}
                        </p>
                      )}
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          )}

          <FadeIn delay={0.1}>
            <div className="mt-20 border border-border bg-muted/30 p-8 text-center md:mt-28 md:p-12">
              <p className="text-eyebrow mb-4 text-primary">¿Tenés un proyecto en mente?</p>
              <h2 className="mx-auto mb-6 max-w-xl font-display text-2xl text-foreground md:text-3xl">
                Diseñá tu proyecto con el asistente
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/guia-proyecto">
                    Iniciar proyecto <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/proveedores">Ver proveedores</Link>
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
