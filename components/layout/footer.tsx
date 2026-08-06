import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

import { accesos, navGroups } from '@/config/navigation'
import { PromaderaMark } from '@/components/promadera-mark'

const institucional = navGroups.find((g) => g.theme === 'Institucional')?.items ?? []

const legalLinks = [
  { href: '/mapa-del-sitio', label: 'Mapa del sitio' },
  { href: '/privacidad', label: 'Privacidad' },
  { href: '/terminos', label: 'Términos' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/confianza', label: 'Confianza' },
]

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-wide section-sm grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="mb-4 flex items-center gap-3">
            <PromaderaMark className="h-8 w-auto text-primary-foreground" />
            <span className="font-display text-xl tracking-tight">Promadera</span>
          </div>
          <p className="mb-6 max-w-sm text-pretty text-sm leading-relaxed text-primary-foreground/70">
            El ecosistema digital de la construcción en madera. Corrientes, Argentina.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm lg:col-span-7">
          <div>
            <h4 className="mb-4 font-sans text-xs uppercase tracking-[0.2em] text-primary-foreground/50">
              Empezá acá
            </h4>
            <ul className="space-y-2.5">
              {accesos.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-secondary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-sans text-xs uppercase tracking-[0.2em] text-primary-foreground/50">
              Institucional
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/empresas" className="transition-colors hover:text-secondary">
                  Para empresas
                </Link>
              </li>
              {institucional.map((item) =>
                item.external ? (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 transition-colors hover:text-secondary"
                    >
                      {item.label} <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </li>
                ) : (
                  <li key={item.href}>
                    <Link href={item.href} className="transition-colors hover:text-secondary">
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container-wide flex flex-col items-center justify-between gap-3 py-5 text-xs uppercase tracking-[0.2em] text-primary-foreground/60 md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {legalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-secondary"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <span>© {new Date().getFullYear()} Promadera</span>
        </div>
      </div>
    </footer>
  )
}
