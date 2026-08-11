'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  COOKIE_PREFS_EVENT,
  getCookieConsent,
  setCookieConsent,
  type CookieConsent,
} from '@/lib/cookies'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [hadPrevious, setHadPrevious] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const acceptRef = useRef<HTMLButtonElement>(null)
  const lastFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!getCookieConsent()) setVisible(true)
    const open = () => {
      lastFocused.current = document.activeElement as HTMLElement | null
      setHadPrevious(Boolean(getCookieConsent()))
      setVisible(true)
    }
    window.addEventListener(COOKIE_PREFS_EVENT, open)
    return () => window.removeEventListener(COOKIE_PREFS_EVENT, open)
  }, [])

  // Mover el foco al banner al abrirse, sin robar el foco de la navegación inicial de forma abrupta.
  useEffect(() => {
    if (visible) acceptRef.current?.focus()
  }, [visible])

  const close = useCallback(() => {
    setVisible(false)
    lastFocused.current?.focus?.()
  }, [])

  const decide = (value: CookieConsent) => {
    setCookieConsent(value)
    close()
  }

  // Escape solo cierra si ya existe una decisión previa (banner reabierto).
  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && hadPrevious) close()
      if (e.key !== 'Tab') return
      const nodes = containerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (!nodes || nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement
      if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [visible, hadPrevious, close])

  if (!visible) return null

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className="fixed inset-x-0 bottom-0 z-[60] animate-fade-in border-t border-border bg-surface backdrop-blur-md"
    >
      <div className="container-wide flex flex-col gap-4 py-5 md:flex-row md:items-center">
        <div className="flex-1">
          <h2 id="cookie-banner-title" className="sr-only">
            Preferencias de cookies
          </h2>
          <p id="cookie-banner-desc" className="text-sm leading-relaxed text-foreground/80">
            Usamos cookies necesarias para que el sitio funcione y, con tu permiso, analíticas
            para mejorarlo. Leé la{' '}
            <Link href="/cookies" className="underline">
              política de cookies
            </Link>{' '}
            y la{' '}
            <Link href="/privacidad" className="underline">
              privacidad
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <Button variant="outline" onClick={() => decide('rejected')}>
            Solo necesarias
          </Button>
          <Button ref={acceptRef} onClick={() => decide('accepted')}>
            Aceptar todas
          </Button>
        </div>
      </div>
    </div>
  )
}
