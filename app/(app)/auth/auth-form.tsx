'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginAction, signupAction, type AuthState } from './actions'

const initialState: AuthState = {}

export function AuthForm({ next }: { next: string }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const action = mode === 'signin' ? loginAction : signupAction
  const [state, formAction, isPending] = useActionState(action, initialState)

  return (
    <div className="container-prose section max-w-md">
      <h1 className="mb-2 text-3xl">{mode === 'signin' ? 'Ingresar' : 'Crear cuenta'}</h1>
      <p className="mb-8 text-muted-foreground">
        {mode === 'signin'
          ? 'Gestioná tus cotizaciones y recursos.'
          : 'Creá tu cuenta en Promadera.'}
      </p>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />

        {mode === 'signup' && (
          <div>
            <Label htmlFor="nombreCompleto">Nombre completo</Label>
            <Input id="nombreCompleto" name="nombreCompleto" required maxLength={120} />
          </div>
        )}

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>

        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />
          {mode === 'signup' && (
            <p className="mt-1 text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
          )}
        </div>

        {state.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? mode === 'signin'
              ? 'Ingresando…'
              : 'Creando cuenta…'
            : mode === 'signin'
              ? 'Ingresar'
              : 'Crear cuenta'}
        </Button>

        <button
          type="button"
          className="text-sm text-muted-foreground underline"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        >
          {mode === 'signin' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Ingresá'}
        </button>
      </form>

      <p className="mt-8 text-xs text-muted-foreground">
        Al continuar aceptás nuestros términos.{' '}
        <Link href="/contacto" className="underline">
          ¿Necesitás ayuda?
        </Link>
      </p>
    </div>
  )
}
