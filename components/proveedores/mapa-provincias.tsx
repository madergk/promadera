'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { PROVINCIAS_MAPA } from '@/lib/provincias'

// Proyección equirectangular simple ajustada al territorio continental argentino.
const LON_MIN = -74
const LON_MAX = -53
const LAT_MIN = -55.5
const LAT_MAX = -21.5
const W = 300
const H = 520

const px = (lon: number) => ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * W
const py = (lat: number) => ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H

interface Props {
  conteos: Record<string, number>
  seleccionada: string | null
  onSelect: (provincia: string | null) => void
}

export function MapaProvincias({ conteos, seleccionada, onSelect }: Props) {
  const max = useMemo(() => Math.max(1, ...Object.values(conteos)), [conteos])
  const conProveedores = PROVINCIAS_MAPA.filter((p) => (conteos[p.nombre] ?? 0) > 0)

  return (
    <div className="grid items-start gap-10 md:grid-cols-[minmax(0,320px)_1fr]">
      <div className="relative border border-border bg-card p-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Mapa de proveedores por provincia"
          className="h-auto w-full"
        >
          <defs>
            <pattern id="mapa-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M20 0H0V20"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                opacity="0.6"
              />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#mapa-grid)" />
          {PROVINCIAS_MAPA.map((p) => {
            const n = conteos[p.nombre] ?? 0
            const activa = seleccionada === p.nombre
            const r = n > 0 ? 5 + (n / max) * 10 : 3
            return (
              <g key={p.nombre}>
                <circle
                  cx={px(p.lon)}
                  cy={py(p.lat)}
                  r={r}
                  className={cn('transition-all', n > 0 ? 'cursor-pointer' : 'cursor-default')}
                  fill={
                    activa
                      ? 'hsl(var(--primary))'
                      : n > 0
                        ? 'hsl(var(--accent))'
                        : 'hsl(var(--muted-foreground))'
                  }
                  fillOpacity={n > 0 ? (activa ? 1 : 0.7) : 0.25}
                  onClick={() => n > 0 && onSelect(activa ? null : p.nombre)}
                >
                  <title>{`${p.nombre} — ${n} ${n === 1 ? 'proveedor' : 'proveedores'}`}</title>
                </circle>
              </g>
            )
          })}
        </svg>
      </div>

      <div>
        <p className="text-eyebrow mb-4 text-muted-foreground">Explorar por provincia</p>
        {conProveedores.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay proveedores publicados para mostrar en el mapa.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {conProveedores
              .slice()
              .sort((a, b) => (conteos[b.nombre] ?? 0) - (conteos[a.nombre] ?? 0))
              .map((p) => {
                const activa = seleccionada === p.nombre
                return (
                  <button
                    key={p.nombre}
                    onClick={() => onSelect(activa ? null : p.nombre)}
                    aria-pressed={activa}
                    className={cn(
                      'border px-3.5 py-2 text-xs transition-colors',
                      activa
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
                    )}
                  >
                    {p.nombre}
                    <span className="ml-2 opacity-60">{conteos[p.nombre]}</span>
                  </button>
                )
              })}
          </div>
        )}
        {seleccionada && (
          <button
            onClick={() => onSelect(null)}
            className="link-underline mt-5 text-xs uppercase tracking-[0.2em] text-foreground"
          >
            Ver todo el país
          </button>
        )}
      </div>
    </div>
  )
}
