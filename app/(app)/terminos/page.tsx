import type { Metadata } from 'next'
import { LegalLayout, LegalSection } from '@/components/legal/legal-layout'

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description: 'Condiciones de uso del sitio y de los servicios de Promadera.',
}

export default function TerminosPage() {
  return (
    <LegalLayout
      title="Términos y condiciones"
      intro="Reglas de uso del sitio, de la red de proveedores y de las herramientas de estimación."
    >
      <LegalSection title="Aceptación">
        <p>Al usar este sitio aceptás estos términos. Si no estás de acuerdo, no lo utilices.</p>
      </LegalSection>

      <LegalSection title="Qué ofrece Promadera">
        <p>
          Promadera es una plataforma de infraestructura digital para la construcción en madera:
          directorio de proveedores, obras de referencia, contenidos y herramientas de estimación.
          No ejecutamos obras ni somos parte del contrato entre vos y una empresa de la red.
        </p>
      </LegalSection>

      <LegalSection title="Estimaciones y simulador">
        <p>
          Los resultados del simulador son orientativos, basados en promedios y supuestos. No son
          un presupuesto ni una oferta. El valor final surge del proyecto ejecutivo y de la
          cotización de cada empresa.
        </p>
      </LegalSection>

      <LegalSection title="Cuentas">
        <p>
          Sos responsable de la veracidad de los datos que cargás y del resguardo de tus
          credenciales. Podemos suspender cuentas ante uso indebido o información falsa.
        </p>
      </LegalSection>

      <LegalSection title="Empresas de la red">
        <p>
          Las empresas publican su información bajo su responsabilidad. La verificación de
          documentación no implica garantía sobre la calidad, plazos o cumplimiento de una obra.
        </p>
      </LegalSection>

      <LegalSection title="Propiedad intelectual">
        <p>
          Marcas, textos, imágenes y software del sitio pertenecen a Promadera o a sus titulares.
          No se permite su reproducción sin autorización.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilidad">
        <p>
          El sitio se ofrece &quot;tal cual&quot;. No respondemos por daños derivados de decisiones
          tomadas sobre la base de contenidos o estimaciones publicadas.
        </p>
      </LegalSection>

      <LegalSection title="Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de la República Argentina, con jurisdicción en los
          tribunales ordinarios de la Provincia de Corrientes.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
