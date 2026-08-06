'use client'

import Image from 'next/image'
import Link from 'next/link'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { FadeIn } from '@/components/shared/fade-in'

export type ProyectoDestacado = {
  slug: string
  titulo: string
  categoria: string | null
  imagen: string | null
}

export function ProyectosDestacados({ proyectos }: { proyectos: ProyectoDestacado[] }) {
  return (
    <Carousel opts={{ align: 'start', loop: true }} className="w-full">
      <CarouselContent className="-ml-6 lg:-ml-8">
        {proyectos.map((p, idx) => (
          <CarouselItem key={p.slug} className="pl-6 md:basis-1/2 lg:pl-8">
            <FadeIn delay={idx * 0.08}>
              <Link
                href={`/proyectos/${p.slug}`}
                className="group block h-full overflow-hidden bg-background"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {p.imagen && (
                    <Image
                      src={p.imagen}
                      alt={p.titulo}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-5 md:p-6">
                  {p.categoria && (
                    <div className="text-eyebrow mb-4 flex items-center gap-3 text-primary">
                      <span>{p.categoria}</span>
                    </div>
                  )}
                  <h3 className="text-balance font-display text-2xl leading-tight text-foreground transition-colors group-hover:text-accent md:text-3xl">
                    {p.titulo}
                  </h3>
                </div>
              </Link>
            </FadeIn>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-8 flex gap-3">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselNext className="static translate-y-0" />
      </div>
    </Carousel>
  )
}
