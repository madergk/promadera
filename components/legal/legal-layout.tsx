import type { ReactNode } from 'react'
import Link from 'next/link'

export const LEGAL_UPDATED = '11 de agosto de 2026'

const legalNav = [
  { href: '/privacidad', label: 'Privacidad' },
  { href: '/terminos', label: 'Términos' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/confianza', label: 'Confianza' },
]

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border pt-6">
      <h2 className="mb-3 font-display text-xl">{title}</h2>
      <div className="space-y-3 text-base leading-relaxed text-foreground/80">{children}</div>
    </section>
  )
}

export function LegalLayout({
  title,
  intro,
  children,
}: {
  title: string
  intro: string
  children: ReactNode
}) {
  return (
    <div className="container-prose section max-w-3xl">
      <header className="mb-10">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-primary">Legales</p>
        <h1 className="mb-4">{title}</h1>
        <p className="text-lg text-muted-foreground">{intro}</p>
        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Última actualización: {LEGAL_UPDATED}
        </p>
      </header>

      <nav className="mb-10 flex flex-wrap gap-2" aria-label="Documentos legales">
        {legalNav.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="border border-border px-3 py-1.5 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-muted"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="space-y-8">{children}</div>

      <p className="mt-12 text-sm text-muted-foreground">
        ¿Dudas? Escribinos desde{' '}
        <Link href="/contacto" className="underline">
          contacto
        </Link>
        .
      </p>
    </div>
  )
}
