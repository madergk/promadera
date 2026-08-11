import type { Metadata } from 'next'
import Link from 'next/link'
import { Download, FileText, ArrowRight } from 'lucide-react'

import { PageHeader } from '@/components/shared/page-header'
import { FadeIn } from '@/components/shared/fade-in'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Construir',
  description:
    'Diseño, ingeniería, construcción, sustentabilidad y normativa para construir con madera en Corrientes.',
}

const sections = [
  {
    key: 'diseno',
    title: 'Diseño',
    description:
      'Estrategias bioclimáticas, integración paisajística y lenguaje contemporáneo para el clima subtropical correntino.',
    articles: [
      'Diseño bioclimático con madera local',
      'Lenguaje arquitectónico contemporáneo',
      'Detalles constructivos esenciales',
    ],
  },
  {
    key: 'ingenieria',
    title: 'Ingeniería',
    description:
      'Cálculo estructural, BIM, uniones metálicas y comportamiento sísmico de edificios en madera.',
    articles: ['Cálculo estructural CIRSOC 601', 'BIM aplicado a madera', 'Comportamiento sísmico'],
  },
  {
    key: 'construccion',
    title: 'Construcción',
    description:
      'Sistemas wood frame, CLT, glulam y procesos de obra industrializada con plazos predecibles.',
    articles: ['Wood Frame paso a paso', 'Industrialización de paneles CLT', 'Logística y montaje en obra'],
  },
  {
    key: 'sustentabilidad',
    title: 'Sustentabilidad',
    description: 'Captura de carbono, eficiencia energética, ciclo de vida y certificación FSC.',
    articles: ['Análisis de ciclo de vida', 'Eficiencia energética', 'Certificación FSC'],
  },
  {
    key: 'normativa',
    title: 'Normativa',
    description:
      'Reglamentos provinciales, IRAM, CIRSOC y trámites municipales para construcción en madera.',
    articles: ['Reglamento Provincial 2024', 'IRAM 11900 — Etiquetado energético', 'Trámites municipales'],
  },
]

export default function ConstruirPage() {
  return (
    <>
      <PageHeader
        eyebrow="Conocimiento técnico"
        title="Construir, una decisión integral."
        description="Recursos abiertos para arquitectos, ingenieros, desarrolladores y municipios del NEA argentino."
      />
      <section className="section">
        <div className="space-y-px">
          {sections.map((s, idx) => (
            <FadeIn key={s.key} delay={idx * 0.05}>
              <article
                id={s.key}
                className="container-wide grid items-start gap-10 px-6 py-14 lg:section lg:grid-cols-12 lg:px-12"
              >
                <div className="lg:col-span-4">
                  <p className="text-eyebrow mb-4 text-primary">0{idx + 1}</p>
                  <h2
                    className="text-balance break-words font-display text-3xl text-foreground hyphens-auto md:text-4xl lg:text-5xl"
                    lang="es"
                  >
                    {s.title}
                  </h2>
                </div>
                <div className="lg:col-span-5">
                  <p className="text-base leading-relaxed text-muted-foreground">{s.description}</p>
                  <ul className="mt-8 space-y-4">
                    {s.articles.map((a) => (
                      <li key={a} className="group flex items-start gap-3">
                        <FileText className="mt-1 h-4 w-4 shrink-0 text-accent" />
                        <span className="text-sm text-foreground transition-colors group-hover:text-accent">
                          {a}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex lg:col-span-3 lg:justify-end">
                  <div className="w-full border border-border p-6 lg:max-w-[220px]">
                    <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Recurso destacado
                    </p>
                    <p className="mb-5 font-display text-base leading-tight text-foreground">
                      Manual {s.title.toLowerCase()} en madera
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-3 w-3" />
                      PDF
                    </Button>
                  </div>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
        <div className="container-wide mt-16 text-center">
          <Button asChild variant="default" size="lg">
            <Link href="/contacto">
              Pedir más recursos <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
