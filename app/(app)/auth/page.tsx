import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { AuthForm } from './auth-form'

export const metadata: Metadata = {
  title: 'Ingresar',
  robots: { index: false, follow: false },
}

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const target = next?.startsWith('/') && !next.startsWith('//') ? next : '/'

  const user = await getCurrentUser()
  if (user) {
    redirect(user.onboarded ? target : `/onboarding?next=${encodeURIComponent(target)}`)
  }

  return <AuthForm next={target} />
}
