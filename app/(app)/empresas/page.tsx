import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Boxes, Cpu, Factory, FileCheck2, GraduationCap, Network } from 'lucide-react'

import { PageHeader } from '@/components/shared/page-header'
import { FadeIn } from '@/components/shared/fade-in'
import { SectionHeader } from '@/components/shared/section-header'
import { Button } from '@/components/ui/button'
import { EstadoRevision } from '@/components/empresas/estado-revision'

export const metadata: Metadata = {
  title: 'Para empresas',
  description: 'Sistemas PROMADERA para empresas: BIM, inteligencia artificial, fabricación digital y formación.',
}

const pasos = [
  { title: 'Creá tu cuenta', text: 'Con un mail de contacto para seguir la solicitud.' },
  { title: 'Completá el formulario', text: 'Identidad, oferta, obras y contacto en cuatro pasos.' },
  { title: 'Adjuntá la documentación', text: 'Constancias y respaldos en PDF para verificarte.' },
  { title: 'Revisión y publicación', text: 'Aprobada la ficha, tu perfil se publica en el directorio.' },
]

const documentacion = [
  'Constancia de inscripción AFIP',
  'Habilitación o inscripción provincial',
  'Certificaciones técnicas o de calidad',
  'Antecedentes de obra o portfolio',
  'Seguros y ART vigentes',
  'Otros respaldos institucionales',
]

const sistemas = [
  {
    icon: Boxes,
    title: 'PROMADERA BIM',
    text: 'Bibliotecas BIM, normativas y modelos de datos listos para producción.',
    para: 'Estudios, fabricantes y constructoras',
  },
  {
    icon: Cpu,
    title: 'PROMADERA AI',
    text: 'IA especializada en madera: asiste decisiones y valida modelos.',
    para: 'Constructoras, desarrolladores y equipos técnicos',
  },
  {
    icon: Factory,
    title: 'PROMADERA FAB',
    text: 'Diseño, gestión y fabricación bajo lógica Design to Fabrication.',
    para: 'Fabricantes de viviendas y productos de ingeniería',
  },
  {
    icon: GraduationCap,
    title: 'PROMADERA FORMA',
    text: 'Academia, cursos y certificaciones del sector.',
    para: 'Profesionales, técnicos y empresas',
  },
]

export default function ParaEmpresasPage() {
  return (
    <>
      <PageHeader
        eyebrow="Capa B2B · PROMADERA S.A.S."
        title="Infraestructura tecnológica para tu empresa."
        description="La infraestructura digital para diseñar, fabricar y construir con madera a escala industrial."
        image="/assets/hero-empresas-fab.jpg"
        imageAlt="Fabricación digital de componentes de madera"
        priority
      />

      <section className="section-sm md:section">
        <div className="container-wide">
          <SectionHeader
            eyebrow="Portafolio"
            title="Cuatro sistemas, una arquitectura."
            description="Diseñar con estándares, automatizar documentación, fabricar con precisión y formar equipos."
          />
          <div className="grid gap-px bg-border md:grid-cols-2">
            {sistemas.map((s, idx) => (
              <FadeIn key={s.title} delay={idx * 0.06}>
                <div className="flex h-full flex-col bg-background p-6 transition-colors duration-500 hover:bg-muted/50 md:p-8 lg:p-10">
                  <s.icon className="mb-8 h-7 w-7 text-accent" strokeWidth={1.5} />
                  <h2 className="mb-3 font-display text-xl text-foreground">{s.title}</h2>
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                  <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground/80">
                    {s.para}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="sumar-empresa" className="section-sm md:section bg-muted/40 scroll-mt-24">
        <div className="container-wide">
          <div className="grid items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Network className="mb-6 h-7 w-7 text-accent" strokeWidth={1.5} />
              <h2 className="text-display-lg text-balance text-foreground">Sumá tu empresa a la red.</h2>
              <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
                Las empresas certificadas reciben la demanda del sitio: personas que ya simularon
                su proyecto. Publicá tu perfil, mostrá tus obras y recibí cotizaciones.
              </p>

              <ol className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2">
                {pasos.map((p, i) => (
                  <li key={p.title} className="bg-background p-6">
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Paso {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mb-2 mt-3 font-display text-base text-foreground">{p.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-8 border border-border bg-background p-6">
                <p className="text-eyebrow mb-4 text-muted-foreground">Documentación a adjuntar (PDF)</p>
                <ul className="grid gap-x-8 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2">
                  {documentacion.map((d) => (
                    <li key={d} className="flex items-start gap-2">
                      <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
                      {d}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground">
                  La documentación es confidencial: sólo la ve el equipo de revisión.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/proveedores/alta">
                    Sumar mi empresa <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/contacto">Hablar con el equipo</Link>
                </Button>
              </div>
            </div>

            <div className="lg:sticky lg:top-28 lg:col-span-5">
              <p className="text-eyebrow mb-4 text-muted-foreground">Estado de tu solicitud</p>
              <EstadoRevision />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
