'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PROVINCIAS, RUBROS } from '@/payload/collections/ConsultasProveedores'

const schema = z.object({
  nombre: z.string().trim().min(2, 'Ingresá tu nombre o el de la empresa').max(120),
  email: z.string().trim().email('Email inválido').max(255),
  rubro: z.string().min(1, 'Elegí un rubro'),
  provincia: z.string().min(1, 'Elegí una provincia'),
  sitioWeb: z.string().trim().max(255).optional().or(z.literal('')),
  mensaje: z.string().trim().min(10, 'Contanos un poco más (mín. 10 caracteres)').max(2000),
})

const empty = { nombre: '', email: '', rubro: '', provincia: '', sitioWeb: '', mensaje: '' }

export function FormularioProveedores() {
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState<{ nombre: string; email: string } | null>(null)

  const set = (k: keyof typeof empty, v: string) => setValues((p) => ({ ...p, [k]: v }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (v?.[0]) fieldErrors[k] = v[0]
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const res = await fetch('/api/consultas-proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parsed.data,
          sitioWeb: parsed.data.sitioWeb || undefined,
        }),
      })
      if (!res.ok) throw new Error('request failed')

      setValues(empty)
      setEnviado({ nombre: parsed.data.nombre, email: parsed.data.email })
      toast.success('Consulta enviada. Te contactamos a la brevedad.')
    } catch {
      toast.error('No pudimos enviar tu consulta. Probá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <div className="mx-auto mt-12 max-w-2xl border border-border bg-background p-8 text-center md:p-10">
        <CheckCircle2 className="mx-auto h-10 w-10 text-accent" strokeWidth={1.5} />
        <h3 className="mt-6 font-display text-2xl text-foreground">
          Recibimos tu consulta, {enviado.nombre}.
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Te enviamos un correo de recepción a{' '}
          <span className="text-foreground">{enviado.email}</span>. El equipo de PROMADERA te
          contacta en las próximas 48 h hábiles.
        </p>
        <Button variant="outline" className="mt-8" onClick={() => setEnviado(null)}>
          Enviar otra consulta
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-12 max-w-2xl border border-border bg-background p-6 md:p-8"
    >
      <h3 className="font-display text-2xl text-foreground">Sumate a la red</h3>
      <p className="mt-2 text-sm text-muted-foreground">Dejanos tus datos y te contactamos.</p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fp-nombre">Empresa o contacto</Label>
          <Input
            id="fp-nombre"
            value={values.nombre}
            maxLength={120}
            onChange={(e) => set('nombre', e.target.value)}
          />
          {errors.nombre && <p className="text-xs text-destructive">{errors.nombre}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fp-email">Email</Label>
          <Input
            id="fp-email"
            type="email"
            value={values.email}
            maxLength={255}
            onChange={(e) => set('email', e.target.value)}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fp-rubro">Rubro</Label>
          <Select value={values.rubro} onValueChange={(v) => set('rubro', v)}>
            <SelectTrigger id="fp-rubro">
              <SelectValue placeholder="Elegí un rubro" />
            </SelectTrigger>
            <SelectContent>
              {RUBROS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.rubro && <p className="text-xs text-destructive">{errors.rubro}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fp-provincia">Provincia</Label>
          <Select value={values.provincia} onValueChange={(v) => set('provincia', v)}>
            <SelectTrigger id="fp-provincia">
              <SelectValue placeholder="Elegí una provincia" />
            </SelectTrigger>
            <SelectContent>
              {PROVINCIAS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.provincia && <p className="text-xs text-destructive">{errors.provincia}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="fp-web">
            Sitio web <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="fp-web"
            value={values.sitioWeb}
            maxLength={255}
            placeholder="www.tuempresa.com"
            onChange={(e) => set('sitioWeb', e.target.value)}
          />
          {errors.sitioWeb && <p className="text-xs text-destructive">{errors.sitioWeb}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="fp-mensaje">Mensaje</Label>
          <Textarea
            id="fp-mensaje"
            rows={4}
            value={values.mensaje}
            maxLength={2000}
            placeholder="Qué hacés y cómo querés sumarte."
            onChange={(e) => set('mensaje', e.target.value)}
          />
          {errors.mensaje && <p className="text-xs text-destructive">{errors.mensaje}</p>}
        </div>
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full md:w-auto" disabled={loading}>
        {loading ? 'Enviando…' : 'Enviar consulta'}
      </Button>
    </form>
  )
}
