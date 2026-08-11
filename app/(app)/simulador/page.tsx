import type { Metadata } from 'next'
import { Suspense } from 'react'

import { PageHeader } from '@/components/shared/page-header'
import { CalculadoraImpacto } from '@/components/simulador/calculadora-impacto'

export const metadata: Metadata = {
  title: 'Simulá tu proyecto',
  description:
    'Descubrí cuánto cuesta construir tu casa en madera, en minutos: costo estimado, plazos de obra y carbono capturado según superficie y sistema constructivo.',
}

export default function SimuladorPage() {
  return (
    <>
      <PageHeader
        eyebrow="Simulá tu proyecto"
        title="¿Cuánto cuesta y cuánto tarda?"
        description="Descubrí en minutos el costo estimado, los plazos de obra y el carbono capturado de tu casa en madera."
      />
      {/* useSearchParams exige un boundary de Suspense para no bloquear el prerender estático. */}
      <Suspense>
        <CalculadoraImpacto />
      </Suspense>
    </>
  )
}
