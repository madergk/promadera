import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Leaf, ShieldCheck, Thermometer, Timer } from 'lucide-react'

import { PageHeader } from '@/components/shared/page-header'
import { FadeIn } from '@/components/shared/fade-in'
import { SectionHeader } from '@/components/shared/section-header'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const metadata: Metadata = {
  title: 'Aprendé sobre construir en madera',
  description:
    'Sustentabilidad, aislación, costos, normativa CIRSOC 601, seguridad ante incendios y sismos: lo esencial antes de construir en madera.',
}

const razones = [
  {
    icon: Thermometer,
    title: 'Aísla mucho más',
    text: 'Hasta seis veces más que un muro de ladrillo del mismo espesor: menos aire y menos gas.',
  },
  {
    icon: Leaf,
    title: 'Captura carbono',
    text: 'Cada m³ estructural almacena cerca de una tonelada de CO₂. Es el único material que es sumidero.',
  },
  {
    icon: Timer,
    title: 'Se construye más rápido',
    text: 'Componentes fabricados en planta y montados en obra: hasta 70% menos plazo y menos residuo.',
  },
  {
    icon: ShieldCheck,
    title: 'Tiene respaldo normativo',
    text: 'El CIRSOC 601 regula el cálculo estructural en Argentina: práctica normada y verificable.',
  },
]

const faqs = [
  {
    q: '¿Una casa de madera es segura ante un incendio?',
    a: 'Sí. La madera de gran escuadría carboniza en su capa exterior y conserva la capacidad portante. La resistencia al fuego se calcula y verifica, igual que en hormigón o acero.',
  },
  {
    q: '¿Aguanta sismos y vientos fuertes?',
    a: 'Sí. Al ser liviana recibe menores fuerzas sísmicas. Es el sistema dominante en Chile, Japón, Nueva Zelanda y Estados Unidos.',
  },
  {
    q: '¿Cuánto dura? ¿Se pudre o la comen las termitas?',
    a: 'Con buen diseño (aleros, ventilación, separación del terreno) y maderas tratadas, la vida útil iguala o supera a la construcción tradicional. El enemigo es la humedad mal resuelta.',
  },
  {
    q: '¿Es más cara que una construcción tradicional?',
    a: 'El costo por m² es comparable y muchas veces menor, sobre todo computando plazo de obra y ahorro energético. Estimalo en el simulador.',
  },
  {
    q: '¿Los bancos financian y los municipios aprueban?',
    a: 'Sí. Se aprueba con la misma documentación que cualquier obra: planos, cálculo firmado y memoria. La red conoce los requisitos de cada municipio.',
  },
  {
    q: '¿PROMADERA construye mi casa?',
    a: 'No. Desarrollamos la tecnología que usan las constructoras y te conectamos con empresas certificadas de la red.',
  },
]

const rutas = [
  {
    href: '/construir',
    title: 'Diseño e ingeniería',
    desc: 'Bioclimática, cálculo estructural, BIM y detalles.',
  },
]

export default function AprendePage() {
  return (
    <>
      <PageHeader
        eyebrow="Aprendé"
        title="Lo esencial antes de construir en madera."
        description="Datos, normativa y respuestas concretas a los mitos más comunes."
        image="/assets/hero-aprende.jpg"
        imageAlt="Detalle de estructura de madera"
        priority
      />

      <section className="section-sm md:section">
        <div className="container-wide">
          <SectionHeader eyebrow="Por qué madera" title="Cuatro razones con respaldo técnico." />
          <div className="grid gap-px bg-border md:grid-cols-2">
            {razones.map((r, idx) => (
              <FadeIn key={r.title} delay={idx * 0.06}>
                <div className="h-full bg-background p-6 transition-colors duration-500 hover:bg-muted/50 md:p-8 lg:p-10">
                  <r.icon className="mb-8 h-7 w-7 text-accent" strokeWidth={1.5} />
                  <h2 className="mb-3 font-display text-xl text-foreground">{r.title}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm md:section bg-muted/40">
        <div className="container-wide">
          <SectionHeader
            eyebrow="Profundizar"
            title="Seguí conociendo el sistema."
            description="Los recursos abiertos del ecosistema."
          />
          <div className="border-t border-border">
            {rutas.map((r, idx) => (
              <FadeIn key={r.href} delay={idx * 0.06} y={16}>
                <Link
                  href={r.href}
                  className="group -mx-2 grid grid-cols-[1fr_auto] items-start gap-6 border-b border-border px-2 py-8 transition-colors duration-500 hover:bg-background md:py-10"
                >
                  <div>
                    <h3 className="font-display text-2xl text-foreground transition-colors group-hover:text-accent md:text-3xl">
                      {r.title}
                    </h3>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
                      {r.desc}
                    </p>
                  </div>
                  <ArrowUpRight className="mt-3 h-5 w-5 text-muted-foreground transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent" />
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm md:section">
        <div className="container-wide max-w-3xl">
          <SectionHeader eyebrow="Preguntas frecuentes" title="Las dudas de siempre, respondidas." />
          <Accordion type="single" collapsible className="border-t border-border">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left font-display text-lg md:text-xl">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground md:text-base">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-12 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/simulador">
                Simulá tu proyecto <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/proveedores">Ver proveedores</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
