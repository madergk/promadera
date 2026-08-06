import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calculator,
  Images,
  Leaf,
  ShieldCheck,
  Thermometer,
  Timer,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SectionHeader } from '@/components/shared/section-header'
import { FadeIn } from '@/components/shared/fade-in'
import { FormularioProveedores } from '@/components/home/formulario-proveedores'
import { ProyectosDestacados } from '@/components/home/proyectos-destacados'
import { accesos } from '@/config/navigation'
import { getPayloadClient } from '@/lib/payload'
import { firstMediaUrl } from '@/lib/payload/media'

/**
 * ISR: la home se prerenderiza pero se revalida cada 5 min para que los
 * proyectos publicados desde el CMS aparezcan sin necesidad de un rebuild.
 */
export const revalidate = 300

const accesoIcons = [Calculator, Users, Images, BookOpen]

const razones = [
  {
    icon: Thermometer,
    title: 'Aísla 6 veces más',
    text: 'Que un muro de ladrillo del mismo espesor.',
  },
  {
    icon: Leaf,
    title: 'Captura carbono',
    text: 'Cada m³ estructural almacena cerca de una tonelada de CO₂.',
  },
  { icon: Timer, title: 'Obra más corta', text: 'Prefabricación en planta: hasta 70% menos plazo.' },
  {
    icon: ShieldCheck,
    title: 'Respaldo normativo',
    text: 'CIRSOC 601: práctica normada, no experimental.',
  },
]

const pasos = [
  {
    n: '01',
    title: 'Contás tu proyecto',
    desc: 'Simulás metros, tipología y sistema. Obtenés costo y plazos.',
  },
  { n: '02', title: 'Te conectamos', desc: 'Derivamos tu consulta a la red certificada de tu zona.' },
  { n: '03', title: 'Comparás propuestas', desc: 'Cotizaciones, obras hechas y a quién elegís.' },
  {
    n: '04',
    title: 'Construís con garantía',
    desc: 'Ejecución con estándares y documentación PROMADERA.',
  },
]

const pasosEmpresas = [
  {
    n: '01',
    title: 'Sumás tu empresa',
    desc: 'Completás el alta con tus datos, rubro y zona de cobertura.',
  },
  {
    n: '02',
    title: 'Validamos tu perfil',
    desc: 'Revisamos documentación y antecedentes para certificarte en la red.',
  },
  {
    n: '03',
    title: 'Recibís demanda',
    desc: 'Te llegan consultas y proyectos de tu zona, ya prefiltrados.',
  },
  {
    n: '04',
    title: 'Cotizás y mostrás obra',
    desc: 'Enviás propuestas y publicás tus obras en el directorio.',
  },
]

const faqs = [
  {
    q: '¿Una casa de madera es segura ante un incendio?',
    a: 'Sí. La madera carboniza en su capa exterior y conserva la capacidad portante. La resistencia al fuego se calcula y verifica, igual que en hormigón o acero.',
  },
  {
    q: '¿Aguanta sismos y vientos fuertes?',
    a: 'Sí: al ser liviana recibe menores fuerzas sísmicas. Es el sistema dominante en Chile, Japón y Nueva Zelanda.',
  },
  {
    q: '¿Es más cara que una construcción tradicional?',
    a: 'El costo por m² es comparable y muchas veces menor. Estimalo en el simulador.',
  },
  {
    q: '¿PROMADERA construye mi casa?',
    a: 'No. Desarrollamos la tecnología y te conectamos con constructoras certificadas de la red.',
  },
]

async function getProyectosDestacados() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'proyectos',
    where: { publicado: { equals: true } },
    limit: 4,
    depth: 1,
    sort: '-createdAt',
  })

  return docs.map((p) => ({
    slug: p.slug,
    titulo: p.titulo,
    categoria: p.categoria ?? null,
    imagen: firstMediaUrl(p.galeria),
  }))
}

export default async function HomePage() {
  const destacados = await getProyectosDestacados()

  return (
    <>
      {/* HERO — anula el pt-20 del layout para quedar bajo el header transparente */}
      <section className="hero-section relative -mt-20 flex min-h-screen items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/hero-interior-madera.jpg"
            alt="Interior acogedor y moderno de una casa de madera: estructura vista, ventanales y luz cálida al atardecer"
            fill
            priority
            sizes="100vw"
            className="hero-media animate-ken-burns object-cover"
          />
          <div className="hero-overlay" />
          <div className="hero-vignette" />
          <div className="hero-grain" />
        </div>

        <div className="container-wide relative z-10 pb-20 pt-28 sm:pb-24 sm:pt-32 md:pb-32 md:pt-40">
          <h1
            className="max-w-4xl animate-fade-in text-balance font-display text-[2.75rem] leading-[1.05] text-background sm:text-5xl sm:leading-[1] md:text-6xl md:leading-[0.98] lg:text-[5.25rem]"
            style={{ animationDelay: '0.35s' }}
          >
            Construí en madera, con quienes saben hacerlo.
          </h1>
          <p
            className="mt-5 max-w-lg animate-fade-in text-base leading-relaxed text-background/80 md:mt-6 md:text-lg"
            style={{ animationDelay: '0.6s' }}
          >
            Estimá costo y plazos, y conectate con la red certificada PROMADERA.
          </p>
          <div
            className="mt-8 flex animate-fade-in flex-wrap gap-3 sm:gap-4 md:mt-10"
            style={{ animationDelay: '0.8s' }}
          >
            <Button asChild variant="hero" size="lg">
              <Link href="/proyectos">
                Proyectos <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <Link href="/proveedores">Proveedores</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="section-sm md:section">
        <div className="container-wide">
          <SectionHeader
            eyebrow="Cómo funciona"
            title="De la idea a la obra, en cuatro pasos."
            align="center"
            className="mx-auto"
          />
          <Tabs defaultValue="personas" className="w-full">
            <TabsList className="mx-auto mb-10 flex w-full max-w-md rounded-none bg-muted p-1">
              <TabsTrigger value="personas" className="flex-1 rounded-none text-sm">
                Quiero construir
              </TabsTrigger>
              <TabsTrigger value="empresas" className="flex-1 rounded-none text-sm">
                Empresas y proveedores
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personas" className="mt-0">
              <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-4">
                {pasos.map((s, idx) => (
                  <FadeIn key={s.n} delay={idx * 0.06}>
                    <div className="h-full bg-background p-6 md:p-8 lg:p-10">
                      <span className="font-display text-sm tracking-[0.2em] text-accent">{s.n}</span>
                      <h3 className="mb-3 mt-6 font-display text-xl text-foreground">{s.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
              <div className="mt-12 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/simulador">
                    Simulá tu proyecto <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/proveedores">Ver proveedores</Link>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="empresas" className="mt-0">
              <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-4">
                {pasosEmpresas.map((s, idx) => (
                  <FadeIn key={s.n} delay={idx * 0.06}>
                    <div className="h-full bg-background p-6 md:p-8 lg:p-10">
                      <span className="font-display text-sm tracking-[0.2em] text-accent">{s.n}</span>
                      <h3 className="mb-3 mt-6 font-display text-xl text-foreground">{s.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
              <div className="mt-12 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/proveedores/alta">
                    Sumá tu empresa <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/empresas">Ver beneficios</Link>
                </Button>
              </div>
              <FormularioProveedores />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* LOS 4 ACCESOS */}
      <section className="section-sm bg-muted/40 md:section">
        <div className="container-wide">
          <SectionHeader
            eyebrow="Empezá acá"
            title="¿Por dónde querés empezar?"
            description="Cuatro accesos, en el orden que te sirva."
          />
          <div className="grid gap-px bg-border md:grid-cols-2">
            {accesos.map((a, idx) => {
              const Icon = accesoIcons[idx]
              return (
                <FadeIn key={a.href} delay={idx * 0.06}>
                  <Link
                    href={a.href}
                    className="group flex h-full flex-col bg-background p-6 transition-colors duration-500 hover:bg-muted/50 md:p-8 lg:p-10"
                  >
                    <div className="mb-8 flex items-start justify-between">
                      <Icon className="h-7 w-7 text-accent" strokeWidth={1.5} />
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent" />
                    </div>
                    <p className="text-eyebrow mb-3 text-primary">{a.question}</p>
                    <h3 className="mb-3 text-balance font-display text-2xl text-foreground transition-colors group-hover:text-accent md:text-3xl">
                      {a.label}
                    </h3>
                    <p className="flex-1 text-sm leading-relaxed text-muted-foreground md:text-base">
                      {a.copy}
                    </p>
                  </Link>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* POR QUÉ MADERA */}
      <section className="section-sm md:section">
        <div className="container-wide">
          <SectionHeader
            eyebrow="Por qué madera"
            title="Cuatro razones con datos."
            description="Material renovable, normado y más eficiente."
          />
          <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-4">
            {razones.map((r, idx) => (
              <FadeIn key={r.title} delay={idx * 0.06}>
                <div className="h-full bg-background p-6 md:p-8 lg:p-10">
                  <r.icon className="mb-8 h-7 w-7 text-accent" strokeWidth={1.5} />
                  <h3 className="mb-3 font-display text-xl text-foreground">{r.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/aprende">
                Aprendé más <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* INSPIRATE */}
      {destacados.length > 0 && (
        <section className="section-sm bg-muted/40 md:section">
          <div className="container-wide">
            <div className="mb-10 flex items-end justify-between gap-8 md:mb-12">
              <SectionHeader eyebrow="Inspirate" title="Obras destacadas" className="mb-0" />
              <Link
                href="/proyectos"
                className="link-underline hidden items-center gap-2 whitespace-nowrap text-sm font-medium md:inline-flex"
              >
                Ver todas <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ProyectosDestacados proyectos={destacados} />
          </div>
        </section>
      )}

      {/* PROGRAMA MADERA CORRENTINA */}
      <section className="section-sm md:section">
        <div className="container-wide grid items-start gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader
              eyebrow="INICIATIVAS"
              title={'Programa\nMadera Correntina'}
              className="mb-0"
            />
          </div>
          <div className="space-y-6 lg:col-span-7">
            <p className="text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              Creemos que la evolución del sector foresto-industrial, y de la construcción en madera,
              requiere de alianzas y esfuerzos de los sectores involucrados. Desde ese lugar, venimos
              trabajando en un Programa de promoción para la Madera Correntina, como recurso
              estratégico tanto de la provincia como del nuestro país.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <a href="https://www.maderacorrentina.com" target="_blank" rel="noopener noreferrer">
                  Sitio oficial del programa <ArrowRight />
                </a>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/nosotros">Quiénes somos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-sm bg-muted/40 md:section">
        <div className="container-wide max-w-3xl">
          <SectionHeader eyebrow="Preguntas frecuentes" title="Las dudas de siempre." />
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
          <div className="mt-10">
            <Link
              href="/aprende"
              className="link-underline inline-flex items-center gap-2 text-sm font-medium"
            >
              Ver todas las respuestas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
