'use client'

import { useActionState, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  GraduationCap,
  Hammer,
  Trees,
  TrendingUp,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { completeOnboarding, type OnboardingState } from './actions'
import type { ProfileType } from '@/payload/collections/Users'

const PROFILE_OPTIONS: {
  value: ProfileType
  label: string
  description: string
  icon: typeof Building2
}[] = [
  {
    value: 'empresa',
    label: 'Empresa / Comprador',
    description: 'Solicito cotizaciones de madera y productos forestales.',
    icon: Building2,
  },
  {
    value: 'particular',
    label: 'Particular',
    description: 'Cotizo un proyecto de construcción o reforma personal.',
    icon: Hammer,
  },
  {
    value: 'inversor',
    label: 'Inversor',
    description: 'Me interesan oportunidades en proyectos forestales.',
    icon: TrendingUp,
  },
  {
    value: 'productor',
    label: 'Productor forestal',
    description: 'Ofrezco madera o gestiono plantaciones.',
    icon: Trees,
  },
  {
    value: 'estudiante',
    label: 'Estudiante / Investigador',
    description: 'Accedo a biblioteca, cursos y recursos educativos.',
    icon: GraduationCap,
  },
]

const INTERESES_POR_PERFIL: Record<ProfileType, string[]> = {
  empresa: [
    'Madera aserrada',
    'Tableros y compensados',
    'Madera laminada (CLT/Glulam)',
    'Pellets / biomasa',
    'Muebles a medida',
  ],
  particular: [
    'Construcción en madera',
    'Reforma o ampliación',
    'Pérgolas / decks',
    'Muebles a medida',
    'Asesoría técnica',
  ],
  inversor: [
    'Plantaciones forestales',
    'Industrialización',
    'Bonos de carbono',
    'Real estate en madera',
    'Co-inversión',
  ],
  productor: [
    'Venta de rollizos',
    'Aserraderos',
    'Asistencia técnica',
    'Certificación FSC',
    'Logística',
  ],
  estudiante: [
    'Construcción sustentable',
    'Silvicultura',
    'Industria forestal',
    'Cambio climático',
    'Diseño con madera',
  ],
}

const STEPS = ['Tu perfil', 'Datos básicos', 'Intereses'] as const

const initialState: OnboardingState = {}

export function OnboardingForm({
  next,
  defaults,
}: {
  next: string
  defaults: {
    nombreCompleto: string
    telefono: string
    organizacion: string
    pais: string
    provincia: string
    ciudad: string
    profileType: ProfileType | ''
  }
}) {
  const [state, formAction, isPending] = useActionState(completeOnboarding, initialState)
  const [step, setStep] = useState(0)
  const [profileType, setProfileType] = useState<ProfileType | ''>(defaults.profileType)
  const [nombreCompleto, setNombreCompleto] = useState(defaults.nombreCompleto)
  const [ciudad, setCiudad] = useState(defaults.ciudad)
  const [intereses, setIntereses] = useState<string[]>([])

  const toggleInteres = (item: string) =>
    setIntereses((arr) => (arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]))

  const canNext = () => {
    if (step === 0) return Boolean(profileType)
    if (step === 1) return nombreCompleto.trim().length > 1 && ciudad.trim().length > 0
    return true
  }

  return (
    <form action={formAction} className="container-prose section max-w-2xl">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="profileType" value={profileType} />
      {intereses.map((i) => (
        <input key={i} type="hidden" name="intereses" value={i} />
      ))}

      <div className="mb-10 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'grid h-8 w-8 place-items-center rounded-full text-xs font-medium transition-colors',
                i < step
                  ? 'bg-primary text-primary-foreground'
                  : i === step
                    ? 'border border-primary bg-primary/15 text-primary'
                    : 'bg-muted text-muted-foreground',
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('h-px flex-1', i < step ? 'bg-primary' : 'bg-border')} />
            )}
          </div>
        ))}
      </div>

      <h1 className="mb-2 text-3xl">{STEPS[step]}</h1>
      <p className="mb-8 text-muted-foreground">
        {step === 0 && 'Contanos cómo nos vas a usar para personalizar tu experiencia.'}
        {step === 1 && 'Datos de contacto para que podamos responderte mejor.'}
        {step === 2 && 'Marcá los temas que más te interesan.'}
      </p>

      {/* Los pasos ocultos se mantienen montados para que sus campos viajen en el submit. */}
      <div className={cn('grid gap-3', step !== 0 && 'hidden')}>
        {PROFILE_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const active = profileType === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setProfileType(opt.value)}
              className={cn(
                'flex items-start gap-4 border p-4 text-left transition-all hover:bg-muted/40',
                active ? 'border-primary bg-primary/5' : 'border-border',
              )}
            >
              <div
                className={cn(
                  'grid h-10 w-10 shrink-0 place-items-center',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{opt.label}</div>
                <div className="text-sm text-muted-foreground">{opt.description}</div>
              </div>
              {active && <Check className="h-5 w-5 shrink-0 text-primary" />}
            </button>
          )
        })}
      </div>

      <div className={cn('space-y-4', step !== 1 && 'hidden')}>
        <div>
          <Label htmlFor="nombreCompleto">Nombre completo *</Label>
          <Input
            id="nombreCompleto"
            name="nombreCompleto"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            maxLength={120}
          />
        </div>
        <div>
          <Label htmlFor="telefono">Teléfono / WhatsApp</Label>
          <Input
            id="telefono"
            name="telefono"
            defaultValue={defaults.telefono}
            placeholder="+54 379 123 4567"
            maxLength={30}
          />
        </div>
        {(profileType === 'empresa' ||
          profileType === 'productor' ||
          profileType === 'estudiante') && (
          <div>
            <Label htmlFor="organizacion">
              {profileType === 'estudiante' ? 'Institución' : 'Empresa / Organización'}
            </Label>
            <Input
              id="organizacion"
              name="organizacion"
              defaultValue={defaults.organizacion}
              maxLength={150}
            />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="ciudad">Ciudad *</Label>
          <Input
            id="ciudad"
            name="ciudad"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            maxLength={80}
          />
        </div>
      </div>

      <div className={cn('space-y-6', step !== 2 && 'hidden')}>
        {profileType && (
          <div className="grid gap-2 sm:grid-cols-2">
            {INTERESES_POR_PERFIL[profileType].map((item) => {
              const active = intereses.includes(item)
              return (
                <label
                  key={item}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 border p-3 transition-colors',
                    active ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40',
                  )}
                >
                  <Checkbox checked={active} onCheckedChange={() => toggleInteres(item)} />
                  <span className="text-sm">{item}</span>
                </label>
              )
            })}
          </div>
        )}
        <div>
          <Label htmlFor="notas">Algo más que quieras contarnos (opcional)</Label>
          <Textarea id="notas" name="notas" maxLength={500} rows={3} />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="mt-6 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="mt-10 flex justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || isPending}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
            Siguiente <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={isPending || !canNext()}>
            {isPending ? 'Guardando…' : 'Finalizar'}
          </Button>
        )}
      </div>
    </form>
  )
}
