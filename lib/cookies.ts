export type CookieConsent = 'accepted' | 'rejected'

export const COOKIE_CONSENT_KEY = 'promadera:cookie-consent'
export const COOKIE_PREFS_EVENT = 'promadera:open-cookie-preferences'

export function getCookieConsent(): CookieConsent | null {
  try {
    const v = localStorage.getItem(COOKIE_CONSENT_KEY)
    return v === 'accepted' || v === 'rejected' ? v : null
  } catch {
    return null
  }
}

export function setCookieConsent(value: CookieConsent) {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, value)
  } catch {
    /* almacenamiento no disponible */
  }
}

/** Reabre el banner para cambiar la elección. */
export function openCookiePreferences() {
  window.dispatchEvent(new CustomEvent(COOKIE_PREFS_EVENT))
}
