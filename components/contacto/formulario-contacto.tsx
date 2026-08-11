'use client'

import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

const schema = z.object({
  nombre: z.string().trim().min(2, 'Ingresá tu nombre').max(100),
  email: z.string().trim().email('Email inválido').max(255),
  organizacion: z.string().trim().max(200).optional(),
  asunto: z.string().trim().min(3, 'Escribí un asunto').max(200),
  mensaje: z.string().trim().min(10, 'Contanos un poco más (mín. 10 caracteres)').max(2000),
})

const empty = { nombre: '', email: '', organizacion: '', asunto: '', mensaje: '' }

export function FormularioContacto() {
  const [values, setValues] = useState(empty)
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof empty, v: string) => setValues((p) => ({ ...p, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/consultas-contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parsed.data,
          organizacion: parsed.data.organizacion || undefined,
        }),
      })
      if (!res.ok) throw new Error('request failed')

      setValues(empty)
      toast.success('Mensaje enviado. Respondemos en 48 hs.')
    } catch {
      toast.error('No pudimos enviar tu mensaje. Probá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 lg:col-span-7">
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Nombre completo *" value={values.nombre} onChange={(v) => set('nombre', v)} />
        <Field
          label="Email *"
          type="email"
          value={values.email}
          onChange={(v) => set('email', v)}
        />
      </div>
      <Field
        label="Organización"
        value={values.organizacion}
        onChange={(v) => set('organizacion', v)}
      />
      <Field label="Asunto *" value={values.asunto} onChange={(v) => set('asunto', v)} />
      <div>
        <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Mensaje *
        </label>
        <textarea
          value={values.mensaje}
          onChange={(e) => set('mensaje', e.target.value)}
          rows={7}
          maxLength={2000}
          className="w-full resize-none border border-border bg-card p-4 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <Button type="submit" disabled={loading} size="lg">
        {loading ? 'Enviando…' : 'Enviar mensaje'}
      </Button>
    </form>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full border border-border bg-card px-4 text-sm focus:border-primary focus:outline-none"
      />
    </div>
  )
}
