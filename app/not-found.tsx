import type { Metadata } from 'next'
import Link from 'next/link'
import { Manrope } from 'next/font/google'
import { ArrowRight } from 'lucide-react'
import './(app)/globals.css'

export const metadata: Metadata = {
  title: 'Página no encontrada — PROMADERA',
}

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
})

/**
 * Fallback global para rutas que no calzan en ningún route group (ni (app)
 * ni (payload)/admin). Next no puede inferir un layout padre en ese caso,
 * así que este archivo debe traer su propio <html>/<body>. Las rutas
 * conocidas dentro de (app) usan app/(app)/not-found.tsx, con el chrome
 * completo del sitio.
 */
export default function GlobalNotFound() {
  return (
    <html lang="es">
      <body className={`${manrope.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="text-eyebrow mb-4 text-primary">Error 404</p>
          <h1 className="max-w-2xl text-balance font-display text-4xl text-foreground md:text-6xl">
            Esta página no existe.
          </h1>
          <p className="mt-6 max-w-md text-base text-muted-foreground md:text-lg">
            Puede que el enlace esté roto o que la sección se haya movido.
          </p>
          <Link
            href="/"
            className="mt-10 inline-flex items-center gap-2 border border-primary/30 px-6 py-3 text-sm font-medium uppercase tracking-[0.06em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Volver al inicio <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </body>
    </html>
  )
}
