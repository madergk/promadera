import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Boxes, FlaskConical, Compass, GraduationCap, Network } from 'lucide-react'

import { PageHeader } from '@/components/shared/page-header'
import { FadeIn } from '@/components/shared/fade-in'
import { SectionHeader } from '@/components/shared/section-header'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Quiénes somos',
  description:
    'PROMADERA es una empresa de tecnología aplicada al sector foresto-industrial y la construcción industrializada con madera, con sede en Corrientes, Argentina.',
}

const lineas = [
  {
    icon: Boxes,
    title: 'Productos digitales',
    desc: 'Desarrollo de plataformas y herramientas propias para la cadena de valor.',
  },
  {
    icon: FlaskConical,
    title: 'I+D',
    desc: 'Investigación aplicada en BIM, inteligencia artificial y fabricación digital.',
  },
  {
    icon: Compass,
    title: 'Consultoría',
    desc: 'Acompañamiento especializado para digitalizar procesos productivos.',
  },
  {
    icon: GraduationCap,
    title: 'Formación',
    desc: 'Transferencia de conocimiento técnico a equipos y organizaciones.',
  },
  {
    icon: Network,
    title: 'Programas sectoriales',
    desc: 'Diseño y operación de programas de innovación con actores del sector.',
  },
]

const pilares = [
  {
    title: 'Visión',
    text: 'Ser la empresa tecnológica líder en América Latina en soluciones digitales para la construcción industrializada con madera.',
  },
  {
    title: 'Misión',
    text: 'Desarrollar tecnologías que integren conocimiento técnico, diseño, ingeniería, fabricación y gestión para mejorar la productividad y la sostenibilidad de la industria.',
  },
  {
    title: 'Propósito',
    text: 'Transformar el conocimiento en infraestructura tecnológica para impulsar una nueva industria de la construcción con madera.',
  },
]

const ventajas = [
  {
    title: 'Conocimiento estructurado',
    text: 'Convertimos conocimiento disperso del sector en modelos computables.',
  },
  {
    title: 'Arquitectura + ingeniería',
    text: 'Combinamos ambas disciplinas para diseñar sistemas, no herramientas sueltas.',
  },
  {
    title: 'Infraestructura propia',
    text: 'Diseñada para este sector, no adaptada desde otra industria.',
  },
  {
    title: 'First mover',
    text: 'Sin competidores directos en sistematización integral de la cadena en Argentina.',
  },
  {
    title: 'Programas institucionales',
    text: 'Vínculos con cámaras, gobierno provincial y universidades.',
  },
  {
    title: 'Efectos de red',
    text: 'Cuanto más crece el ecosistema, más valor recibe y aporta cada participante.',
  },
]

export default function NosotrosPage() {
  return (
    <>
      <PageHeader
        eyebrow="PROMADERA S.A.S. · Corrientes, Argentina"
        title="Diseñamos la infraestructura tecnológica de la madera."
        description="Somos una empresa de tecnología aplicada al sector de la construcción con madera."
        image="/assets/hero-nosotros.jpg"
        imageAlt="Interior de una construcción en madera"
        priority
      />

      <section className="section-sm md:section">
        <div className="container-wide grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeader eyebrow="Quiénes somos" title="Del producto al sistema." />
          </div>
          <div className="space-y-6 text-base leading-relaxed text-muted-foreground md:text-lg lg:col-span-7">
            <FadeIn>
              <p>
                No somos una constructora, ni un estudio de arquitectura, ni una consultora BIM
                tradicional, ni una software factory.
              </p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <p>
                Diseñamos, desarrollamos e integramos sistemas y capacidades que organizan el
                conocimiento técnico, digitalizan procesos, conectan actores y aceleran la
                transformación de toda la cadena de valor de la madera.
              </p>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="border-l-2 border-accent pl-6 text-foreground">
                No vendemos productos aislados: diseñamos la arquitectura tecnológica sobre la
                cual el sector puede evolucionar y escalar de manera eficiente y sustentable.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="section-sm md:section bg-surface-elevated">
        <div className="container-wide">
          <SectionHeader
            eyebrow="Qué hacemos"
            title="Cinco líneas que se alimentan entre sí."
            description="Cada proyecto genera conocimiento que vuelve a los productos, estándares y herramientas de la empresa."
          />
          <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
            {lineas.map((l, idx) => (
              <FadeIn key={l.title} delay={idx * 0.06}>
                <div className="h-full bg-background p-6 md:p-8 lg:p-10">
                  <l.icon className="mb-8 h-7 w-7 text-accent" strokeWidth={1.5} />
                  <h3 className="mb-3 font-display text-xl text-foreground">{l.title}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">{l.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm md:section">
        <div className="container-wide">
          <SectionHeader eyebrow="Hacia dónde vamos" title="Visión, misión y propósito." />
          <div className="grid gap-px bg-border md:grid-cols-3">
            {pilares.map((p, idx) => (
              <FadeIn key={p.title} delay={idx * 0.06}>
                <div className="h-full bg-background p-6 md:p-8 lg:p-10">
                  <p className="text-eyebrow mb-5 text-primary">{p.title}</p>
                  <p className="text-pretty text-base leading-relaxed text-foreground">{p.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm md:section bg-surface-elevated">
        <div className="container-wide grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeader eyebrow="Tesis" title="Nuestra unidad de innovación es el sistema." />
          </div>
          <div className="space-y-6 text-base leading-relaxed text-muted-foreground md:text-lg lg:col-span-7">
            <FadeIn>
              <p>
                Nacimos en Corrientes, donde convergen el mayor patrimonio forestal del país y una
                fuerte tradición maderera. Es nuestro territorio de origen y validación, con
                vocación nacional y latinoamericana. Entendimos que si bien existe un gran
                potencial para liderar el sector, aún existen barreras que limitan el crecimiento.
              </p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <p>
                Fragmentación de la información, baja interoperabilidad, ausencia de estándares
                digitales y desconexión entre diseño y fabricación no son problemas aislados: son
                síntomas de un mismo problema sistémico.
              </p>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p>
                Ese tipo de problema no se resuelve con herramientas puntuales, sino diseñando
                sistemas que integren información, procesos y actores dentro de una arquitectura
                común.
              </p>
            </FadeIn>
            <FadeIn delay={0.24}>
              <p className="border-l-2 border-accent pl-6 text-foreground">
                No buscamos reemplazar a fabricantes, constructoras, desarrolladores ni estudios:
                les damos la infraestructura tecnológica para escalar, digitalizarse y competir
                mejor.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="section-sm md:section">
        <div className="container-wide">
          <SectionHeader eyebrow="Diferencial" title="Por qué PROMADERA." />
          <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
            {ventajas.map((v, idx) => (
              <FadeIn key={v.title} delay={idx * 0.05}>
                <div className="h-full bg-background p-6 md:p-8">
                  <h3 className="mb-3 font-display text-xl text-foreground">{v.title}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">{v.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm md:section bg-surface-elevated">
        <div className="container-wide flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/empresas">
              Ver sistemas PROMADERA <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="https://www.maderacorrentina.com" target="_blank" rel="noopener noreferrer">
              Programa Madera Correntina
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contacto">Contacto</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
