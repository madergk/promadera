import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { PageHeader } from '@/components/shared/page-header'
import { FadeIn } from '@/components/shared/fade-in'
import { navGroups, legalGroup } from '@/config/navigation'

export const metadata: Metadata = {
  title: 'Mapa del sitio',
  description: 'Todas las secciones de Promadera agrupadas por temática.',
}

const groups = [...navGroups, legalGroup]

export default function MapaDelSitioPage() {
  return (
    <>
      <PageHeader
        eyebrow="Navegación"
        title="Mapa del sitio."
        description="Todas las secciones del sitio: los accesos principales, la capa para empresas y las páginas institucionales."
      />
      <section className="section">
        <div className="container-wide grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group, idx) => (
            <FadeIn key={group.theme} delay={idx * 0.05}>
              <article className="flex h-full flex-col bg-background p-8 md:p-10">
                <p className="mb-3 text-eyebrow text-primary">0{idx + 1}</p>
                <h2 className="mb-4 font-display text-3xl text-foreground md:text-4xl">
                  {group.href ? (
                    <Link href={group.href} className="transition-colors hover:text-primary">
                      {group.theme}
                    </Link>
                  ) : (
                    group.theme
                  )}
                </h2>
                <p className="mb-8 text-pretty text-sm text-muted-foreground">{group.description}</p>
                <ul className="mt-auto space-y-3 border-t border-border pt-6">
                  {group.items.map((item) => {
                    const cls = 'group flex items-start justify-between gap-4 py-1.5'
                    const content = (
                      <>
                        <span>
                          <span className="block font-display text-base text-foreground transition-colors group-hover:text-primary">
                            {item.label}
                          </span>
                          {item.description && (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          )}
                        </span>
                        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                      </>
                    )
                    return (
                      <li key={item.href}>
                        {item.external ? (
                          <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>
                            {content}
                          </a>
                        ) : (
                          <Link href={item.href} className={cls}>
                            {content}
                          </Link>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>
    </>
  )
}
