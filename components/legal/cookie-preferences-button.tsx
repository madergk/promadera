'use client'

import { Button } from '@/components/ui/button'
import { openCookiePreferences } from '@/lib/cookies'

export function CookiePreferencesButton() {
  return (
    <Button variant="outline" onClick={openCookiePreferences}>
      Cambiar preferencias
    </Button>
  )
}
