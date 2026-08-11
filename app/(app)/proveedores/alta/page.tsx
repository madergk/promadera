import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth'
import { AltaWizard } from '@/components/proveedores/alta-wizard'

export const metadata: Metadata = {
  title: 'Sumar mi empresa al directorio',
  description:
    'Publicá tu empresa, productora o estudio en el directorio del ecosistema foresto-industrial correntino.',
  robots: { index: false, follow: false },
}

export default async function ProveedorAltaPage() {
  const user = await requireUser('/proveedores/alta')

  return (
    <AltaWizard
      defaults={{
        nombre: user.organizacion ?? '',
        ubicacion: [user.ciudad, user.provincia].filter(Boolean).join(', '),
        telefono: user.telefono ?? '',
      }}
    />
  )
}
