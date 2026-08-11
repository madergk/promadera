import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { OnboardingForm } from './onboarding-form'
import type { ProfileType } from '@/payload/collections/Users'

export const metadata: Metadata = {
  title: 'Completá tu perfil',
  robots: { index: false, follow: false },
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const target = next?.startsWith('/') && !next.startsWith('//') ? next : '/'

  const user = await requireUser('/onboarding')
  if (user.onboarded) redirect(target)

  return (
    <OnboardingForm
      next={target}
      defaults={{
        nombreCompleto: user.nombreCompleto ?? '',
        telefono: user.telefono ?? '',
        organizacion: user.organizacion ?? '',
        pais: user.pais ?? 'Argentina',
        provincia: user.provincia ?? 'Corrientes',
        ciudad: user.ciudad ?? '',
        profileType: (user.profileType as ProfileType | null) ?? '',
      }}
    />
  )
}
