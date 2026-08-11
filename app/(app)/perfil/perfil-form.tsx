'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { guardarPerfil, type PerfilState } from './actions'

const initialState: PerfilState = {}

export function PerfilForm({
  defaults,
}: {
  defaults: {
    nombreCompleto: string
    telefono: string
    organizacion: string
    pais: string
    provincia: string
    ciudad: string
  }
}) {
  const [state, formAction, isPending] = useActionState(guardarPerfil, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="nombreCompleto">Nombre completo *</Label>
        <Input
          id="nombreCompleto"
          name="nombreCompleto"
          defaultValue={defaults.nombreCompleto}
          maxLength={120}
          required
        />
      </div>
      <div>
        <Label htmlFor="telefono">Teléfono / WhatsApp</Label>
        <Input
          id="telefono"
          name="telefono"
          defaultValue={defaults.telefono}
          maxLength={30}
          placeholder="+54 379 123 4567"
        />
      </div>
      <div>
        <Label htmlFor="organizacion">Empresa / Organización</Label>
        <Input
          id="organizacion"
          name="organizacion"
          defaultValue={defaults.organizacion}
          maxLength={150}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="pais">País</Label>
          <Input id="pais" name="pais" defaultValue={defaults.pais} maxLength={80} />
        </div>
        <div>
          <Label htmlFor="provincia">Provincia / Estado</Label>
          <Input
            id="provincia"
            name="provincia"
            defaultValue={defaults.provincia}
            maxLength={80}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="ciudad">Ciudad</Label>
        <Input id="ciudad" name="ciudad" defaultValue={defaults.ciudad} maxLength={80} />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.ok && <p className="text-sm text-success">Cambios guardados.</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </form>
  )
}
