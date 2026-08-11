import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Página no encontrada',
}

export default function NotFound() {
  return (
    <div className="container-wide flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-eyebrow mb-4 text-primary">Error 404</p>
      <h1 className="max-w-2xl text-balance font-display text-4xl text-foreground md:text-6xl">
        Esta página no existe.
      </h1>
      <p className="mt-6 max-w-md text-base text-muted-foreground md:text-lg">
        Puede que el enlace esté roto o que la sección se haya movido.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/">
            Volver al inicio <ArrowRight />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/mapa-del-sitio">Ver el mapa del sitio</Link>
        </Button>
      </div>
    </div>
  )
}
