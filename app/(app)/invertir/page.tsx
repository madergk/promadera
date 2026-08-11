import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Download, TreePine, Factory, GraduationCap, TrendingUp, Truck } from 'lucide-react'

import { FadeIn } from '@/components/shared/fade-in'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Invertir',
  description: 'Oportunidades de inversión en el ecosistema foresto-industrial de Corrientes, Argentina.',
}

const indicators = [
  { value: '528 mil', label: 'Hectáreas forestadas', note: 'Pino y eucalipto certificados FSC' },
  { value: 'USD 410M', label: 'Exportaciones 2025', note: '+18% interanual' },
  { value: '12.400', label: 'Empleos directos', note: 'En la cadena foresto-industrial' },
]

const pillars = [
  {
    icon: TreePine,
    title: 'Recursos forestales',
    text: '528.000 hectáreas forestadas, suelos aptos y clima óptimo para pino y eucalipto.',
  },
  {
    icon: Factory,
    title: 'Infraestructura industrial',
    text: 'Polo foresto-industrial en Virasoro con plantas CLT, glulam y aserraderos modernos.',
  },
  {
    icon: GraduationCap,
    title: 'Capital humano',
    text: '12.400 empleos directos y nuevas tecnicaturas universitarias formando el talento futuro.',
  },
  {
    icon: TrendingUp,
    title: 'Incentivos fiscales',
    text: 'Régimen forestal Ley 25.080 + beneficios provinciales para inversiones productivas.',
  },
  {
    icon: Truck,
    title: 'Casos de inversión',
    text: 'USD 240M en proyectos industriales en marcha, con financiamiento estructurado.',
  },
]

export default function InvertirPage() {
  return (
    <>
      <section className="hero-section relative -mt-20 overflow-hidden border-b border-border pb-20 pt-32 md:pb-32 md:pt-40">
        <div className="hero-media absolute inset-0">
          <Image
            src="/assets/hero-forest.jpg"
            alt="Plantación forestal en Corrientes"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="hero-overlay" />
        <div className="hero-vignette" />
        <div className="hero-grain" />
        <div className="container-wide relative z-10 text-on-media">
          <p className="mb-6 text-xs uppercase tracking-[0.32em] opacity-80">Invertir</p>
          <h1 className="max-w-4xl text-balance font-display text-5xl leading-[1.02] md:text-7xl">
            Una provincia con recursos, talento y futuro.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed opacity-90">
            Corrientes ofrece el ecosistema completo para invertir en producción forestal
            sustentable y manufactura de productos de madera con alto valor agregado.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button variant="hero" size="lg">
              <Download />
              Brochure inversor (PDF)
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <Link href="/contacto">Hablar con la agencia</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="container-wide grid grid-cols-2 divide-x divide-border lg:grid-cols-3">
          {indicators.map((i, idx) => (
            <FadeIn key={i.label} delay={idx * 0.08}>
              <div className="px-6 py-8 md:px-8 md:py-10">
                <p className="text-stat text-3xl text-primary md:text-5xl">{i.value}</p>
                <p className="mt-3 text-sm font-medium text-foreground">{i.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{i.note}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="section-lg">
        <div className="container-wide grid gap-px bg-border md:grid-cols-2 lg:grid-cols-5">
          {pillars.map((p, idx) => (
            <FadeIn key={p.title} delay={idx * 0.06}>
              <div className="h-full bg-background p-8">
                <p.icon className="mb-8 h-7 w-7 text-accent" strokeWidth={1.5} />
                <h3 className="mb-3 font-display text-xl">{p.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="section-lg bg-primary text-primary-foreground">
        <div className="container-wide grid items-center gap-16 lg:grid-cols-2">
          <FadeIn>
            <div>
              <p className="mb-5 text-xs uppercase tracking-[0.2em] text-secondary">
                Documentos institucionales
              </p>
              <h2 className="text-balance font-display text-4xl leading-tight md:text-5xl">
                Toda la información para decidir tu inversión.
              </h2>
              <p className="mt-6 max-w-md leading-relaxed opacity-80">
                Marco legal, incentivos provinciales, mapa de empresas y oportunidades concretas
                disponibles para descarga.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="space-y-3">
              {[
                'Brochure inversor 2026',
                'Régimen Ley 25.080 — Resumen ejecutivo',
                'Mapa de oportunidades industriales',
                'Catálogo de empresas y servicios',
              ].map((d) => (
                <button
                  key={d}
                  className="flex w-full items-center justify-between border border-primary-foreground/30 p-5 transition-colors hover:bg-primary-foreground/10"
                >
                  <span className="text-sm">{d}</span>
                  <Download className="h-4 w-4 text-secondary" />
                </button>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
