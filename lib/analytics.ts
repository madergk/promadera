/**
 * Capa mínima de analytics.
 * Envía eventos a gtag/dataLayer si están disponibles; si no, no hace nada
 * (en desarrollo los loguea por consola para poder verificarlos).
 */
type EventParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return

  const payload = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined))

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, payload)
  } else if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: name, ...payload })
  } else if (process.env.NODE_ENV === 'development') {
    console.debug('[analytics]', name, payload)
  }
}
