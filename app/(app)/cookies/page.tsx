import type { Metadata } from 'next'
import { LegalLayout, LegalSection } from '@/components/legal/legal-layout'
import { CookiePreferencesButton } from '@/components/legal/cookie-preferences-button'

export const metadata: Metadata = {
  title: 'Política de cookies',
  description: 'Qué cookies usa Promadera y cómo gestionar tus preferencias.',
}

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Política de cookies"
      intro="Qué cookies usamos, para qué sirven y cómo cambiar tu elección cuando quieras."
    >
      <LegalSection title="Qué son">
        <p>
          Pequeños archivos que el sitio guarda en tu navegador para recordar preferencias y
          entender cómo se usa la plataforma.
        </p>
      </LegalSection>

      <LegalSection title="Cookies necesarias">
        <p>
          Imprescindibles para que el sitio funcione: sesión de usuario, seguridad, tema visual y
          tu propia elección de cookies. No se pueden desactivar.
        </p>
      </LegalSection>

      <LegalSection title="Cookies analíticas">
        <p>
          Nos ayudan a medir el uso agregado del sitio y mejorar la experiencia. Solo se activan si
          las aceptás.
        </p>
      </LegalSection>

      <LegalSection title="Tus preferencias">
        <p>
          Podés cambiar tu elección en cualquier momento. También podés borrar cookies desde la
          configuración de tu navegador.
        </p>
        <CookiePreferencesButton />
      </LegalSection>
    </LegalLayout>
  )
}
