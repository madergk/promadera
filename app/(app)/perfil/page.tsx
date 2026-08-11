import type { Metadata } from 'next'
import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/app/(app)/auth/actions'
import { PROFILE_TYPES } from '@/payload/collections/Users'
import { PerfilForm } from './perfil-form'

export const metadata: Metadata = {
  title: 'Mi perfil',
  robots: { index: false, follow: false },
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  proveedor: 'Proveedor',
  cliente: 'Cliente',
}

export default async function PerfilPage() {
  const user = await requireUser('/perfil')
  const perfil = PROFILE_TYPES.find((p) => p.value === user.profileType)
  const intereses = (user.intereses ?? []).map((i) => i.interes)

  return (
    <div className="container-prose section max-w-3xl">
      <p className="text-eyebrow mb-3 text-primary">Tu cuenta</p>
      <h1 className="mb-3 font-display text-4xl text-foreground md:text-5xl">Mi perfil</h1>
      <p className="mb-10 text-muted-foreground">{user.email}</p>

      <div className="mb-10 flex flex-wrap gap-3 border-y border-border py-5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
        <span>
          Rol: <span className="text-foreground">{ROLE_LABEL[user.role] ?? user.role}</span>
        </span>
        {perfil && (
          <span>
            Perfil: <span className="text-foreground">{perfil.label}</span>
          </span>
        )}
      </div>

      <PerfilForm
        defaults={{
          nombreCompleto: user.nombreCompleto ?? '',
          telefono: user.telefono ?? '',
          organizacion: user.organizacion ?? '',
          pais: user.pais ?? '',
          provincia: user.provincia ?? '',
          ciudad: user.ciudad ?? '',
        }}
      />

      {intereses.length > 0 && (
        <section className="mt-12">
          <h2 className="text-eyebrow mb-4 text-muted-foreground">Tus intereses</h2>
          <div className="flex flex-wrap gap-2">
            {intereses.map((i) => (
              <span key={i} className="border border-border px-3 py-1.5 text-sm">
                {i}
              </span>
            ))}
          </div>
          <Button asChild variant="link" className="mt-4 px-0">
            <Link href="/onboarding">Editar intereses</Link>
          </Button>
        </section>
      )}

      <section className="mt-12 flex flex-wrap gap-3 border-t border-border pt-8">
        <Button asChild variant="outline">
          <Link href="/mis-cotizaciones">Mis cotizaciones</Link>
        </Button>
        {user.role === 'proveedor' && (
          <Button asChild variant="outline">
            <Link href="/panel-proveedor">Panel del proveedor</Link>
          </Button>
        )}
        <form action={logoutAction}>
          <Button type="submit" variant="ghost">
            Cerrar sesión
          </Button>
        </form>
      </section>
    </div>
  )
}
