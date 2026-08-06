'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink, LogIn, LogOut, Menu, User as UserIcon, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { TAGLINE } from '@/lib/brand'
import { accountNav, navGroups, primaryNav } from '@/config/navigation'
import { useSessionUser } from '@/hooks/use-session-user'
import { PromaderaMark } from '@/components/promadera-mark'
import { logoutAction } from '@/app/(app)/auth/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const pathname = usePathname()
  const { user } = useSessionUser()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  const transparent = isHome && !scrolled && !open
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        transparent
          ? 'bg-transparent'
          : 'border-b border-border bg-background/95 backdrop-blur-md',
      )}
    >
      <div className="container-wide flex h-20 items-center justify-between gap-8">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Promadera - Inicio">
          <PromaderaMark
            className={cn(
              'h-7 w-auto transition-colors duration-500 md:h-8',
              transparent ? 'text-background' : 'text-foreground',
            )}
          />
          <span className="flex flex-col leading-none">
            <span
              className={cn(
                'font-display text-lg tracking-tight transition-colors duration-500 md:text-xl',
                transparent ? 'text-background' : 'text-foreground',
              )}
            >
              Promadera
            </span>
            <span
              className={cn(
                'mt-1 hidden text-[0.62rem] uppercase tracking-[0.18em] transition-colors duration-500 xl:block',
                transparent ? 'text-background/70' : 'text-muted-foreground',
              )}
            >
              {TAGLINE}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors',
                transparent
                  ? 'text-background/90 hover:text-background'
                  : 'text-foreground/80 hover:text-foreground',
                isActive(item.href) && !transparent && 'text-primary',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/simulador"
            className={cn(
              'hidden items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] transition-colors lg:inline-flex',
              transparent
                ? 'bg-background text-primary hover:bg-background/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            Empezá tu proyecto
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  'hidden items-center gap-2 border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.2em] transition-colors lg:inline-flex',
                  transparent
                    ? 'border-background/40 text-background hover:bg-background hover:text-primary'
                    : 'border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground',
                )}
                aria-label="Mi cuenta"
              >
                <UserIcon className="h-4 w-4" />
                <span className="max-w-[110px] truncate normal-case tracking-normal">
                  {user.nombreCompleto?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {accountNav.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Panel de administración</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action={logoutAction}>
                    <button type="submit" className="flex w-full items-center">
                      <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/auth"
              className={cn(
                'hidden items-center gap-2 border px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] transition-colors lg:inline-flex',
                transparent
                  ? 'border-background/40 text-background hover:bg-background hover:text-primary'
                  : 'border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground',
              )}
            >
              <LogIn className="h-4 w-4" /> Ingresar
            </Link>
          )}

          <button
            aria-label="Menú"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={cn(
              'grid h-10 w-10 place-items-center lg:hidden',
              transparent ? 'text-background' : 'text-foreground',
            )}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="max-h-[calc(100vh-5rem)] animate-fade-in overflow-y-auto border-t border-border bg-background lg:hidden">
          <nav className="container-wide flex flex-col gap-8 py-6">
            <div className="flex flex-col gap-1">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'py-2 font-display text-lg',
                    isActive(item.href) ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/simulador"
                className="mt-3 inline-flex justify-center bg-primary px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground"
              >
                Empezá tu proyecto
              </Link>
            </div>

            {navGroups.map((group) => (
              <div key={group.theme}>
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-primary">
                  {group.theme}
                </p>
                <ul className="space-y-1 border-l border-border/60 pl-4">
                  {group.items.map((item) =>
                    item.external ? (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 py-2 text-base text-foreground/80"
                        >
                          {item.label} <ExternalLink className="h-4 w-4" />
                        </a>
                      </li>
                    ) : (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            'block py-2 text-base transition-colors',
                            isActive(item.href)
                              ? 'font-medium text-primary'
                              : 'text-foreground/80',
                          )}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ))}

            <div className="border-t border-border pt-6">
              {user ? (
                <div className="flex flex-col gap-2">
                  {accountNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="py-2 text-base text-foreground/80"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <form action={logoutAction}>
                    <button type="submit" className="py-2 text-left text-base text-foreground/80">
                      Cerrar sesión
                    </button>
                  </form>
                </div>
              ) : (
                <Link href="/auth" className="py-2 text-base font-medium text-primary">
                  Ingresar / Crear cuenta
                </Link>
              )}
              <Link
                href="/mapa-del-sitio"
                className="block pt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground"
              >
                Mapa del sitio
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
