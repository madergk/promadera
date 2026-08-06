'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, MapPin, Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/shared/fade-in'
import { MapaProvincias } from '@/components/proveedores/mapa-provincias'
import { detectarProvincia } from '@/lib/provincias'
import { cn } from '@/lib/utils'

export interface EmpresaCard {
  slug: string
  nombre: string
  sector: string | null
  descripcion: string | null
  ubicacion: string | null
  servicios: string[]
}

export function DirectorioProveedores({ empresas }: { empresas: EmpresaCard[] }) {
  const [sector, setSector] = useState('Todos')
  const [ubicacion, setUbicacion] = useState('Todas')
  const [provincia, setProvincia] = useState<string | null>(null)
  const [q, setQ] = useState('')

  const sectors = useMemo(
    () => [
      'Todos',
      ...Array.from(new Set(empresas.map((e) => e.sector).filter(Boolean) as string[])).sort(),
    ],
    [empresas],
  )
  const ubicaciones = useMemo(
    () => [
      'Todas',
      ...Array.from(new Set(empresas.map((e) => e.ubicacion).filter(Boolean) as string[])).sort(),
    ],
    [empresas],
  )

  const conteosProvincia = useMemo(() => {
    const acc: Record<string, number> = {}
    for (const e of empresas) {
      const p = detectarProvincia(e.ubicacion)
      if (p) acc[p] = (acc[p] ?? 0) + 1
    }
    return acc
  }, [empresas])

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return empresas.filter((c) => {
      if (sector !== 'Todos' && c.sector !== sector) return false
      if (ubicacion !== 'Todas' && c.ubicacion !== ubicacion) return false
      if (provincia && detectarProvincia(c.ubicacion) !== provincia) return false
      if (!term) return true
      return [c.nombre, c.descripcion, c.ubicacion, ...c.servicios]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(term))
    })
  }, [empresas, sector, ubicacion, provincia, q])

  const conFiltros = sector !== 'Todos' || ubicacion !== 'Todas' || !!provincia || !!q.trim()

  const limpiar = () => {
    setSector('Todos')
    setUbicacion('Todas')
    setProvincia(null)
    setQ('')
  }

  return (
    <section className="section">
      <div className="container-wide">
        <div className="mb-8 grid items-center gap-4 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <label htmlFor="empresas-search" className="sr-only">
              Buscar empresa o servicio
            </label>
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="empresas-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar empresa, servicio o zona"
              aria-label="Buscar empresa o servicio"
              className="h-12 w-full border border-border bg-card pl-12 pr-4 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <Button asChild className="h-12 whitespace-nowrap">
            <Link href="/proveedores/alta">
              <Plus className="h-4 w-4" />
              Sumar mi empresa
            </Link>
          </Button>
        </div>

        <div className="mb-10 border-b border-border pb-10">
          <MapaProvincias
            conteos={conteosProvincia}
            seleccionada={provincia}
            onSelect={setProvincia}
          />
        </div>

        <div className="mb-12 space-y-4 border-b border-border pb-8">
          <div>
            <p className="text-eyebrow mb-3 text-muted-foreground">Sector</p>
            <div className="flex flex-wrap gap-2">
              {sectors.map((s) => (
                <button
                  key={s}
                  onClick={() => setSector(s)}
                  className={cn(
                    'border px-4 py-2 text-xs uppercase tracking-[0.16em] transition-colors',
                    sector === s
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-eyebrow mb-3 text-muted-foreground">Ubicación</p>
            <div className="flex flex-wrap gap-2">
              {ubicaciones.map((u) => (
                <button
                  key={u}
                  onClick={() => setUbicacion(u)}
                  className={cn(
                    'border px-3.5 py-2 text-xs transition-colors',
                    ubicacion === u
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
                  )}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {list.length} {list.length === 1 ? 'proveedor' : 'proveedores'}
            </p>
            {conFiltros && (
              <button
                onClick={limpiar}
                className="link-underline text-xs uppercase tracking-[0.2em] text-foreground"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          {list.map((c, idx) => (
            <FadeIn key={c.slug} delay={(idx % 6) * 0.05}>
              <Link
                href={`/proveedores/${c.slug}`}
                className="group flex h-full flex-col bg-background p-8 transition-colors hover:bg-muted/40"
              >
                <p className="text-eyebrow mb-5 text-primary">{c.sector}</p>
                <h3 className="font-display text-xl text-foreground transition-colors group-hover:text-accent md:text-2xl">
                  {c.nombre}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{c.descripcion}</p>
                {c.servicios.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {c.servicios.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="border border-border px-2 py-1 text-[11px] text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-auto flex items-center justify-between pt-6 text-xs text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {c.ubicacion}
                  </span>
                  <span className="inline-flex items-center gap-1 transition-colors group-hover:text-accent">
                    Ver perfil <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>

        {list.length === 0 && (
          <div className="section space-y-4 text-center text-muted-foreground">
            <p>Sin resultados para tu búsqueda.</p>
            <Button variant="outline" onClick={limpiar}>
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
