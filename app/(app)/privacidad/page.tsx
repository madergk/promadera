import type { Metadata } from 'next'
import { LegalLayout, LegalSection } from '@/components/legal/legal-layout'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Qué datos recolecta Promadera, con qué fin y cómo ejercer tus derechos.',
}

export default function PrivacidadPage() {
  return (
    <LegalLayout
      title="Política de privacidad"
      intro="Cómo tratamos tus datos personales en Promadera y qué derechos tenés sobre ellos."
    >
      <LegalSection title="Responsable">
        <p>
          Promadera (Corrientes, Argentina) es responsable del tratamiento de los datos
          personales que se recolectan en este sitio.
        </p>
      </LegalSection>

      <LegalSection title="Qué datos recolectamos">
        <ul className="list-disc space-y-1 pl-5">
          <li>Datos de cuenta: nombre, email y perfil.</li>
          <li>Datos de contacto y consultas: mensajes, empresa, provincia, sitio web.</li>
          <li>Datos de alta de proveedores: información institucional y documentación cargada.</li>
          <li>Datos técnicos mínimos de uso del sitio (ver la política de cookies).</li>
        </ul>
      </LegalSection>

      <LegalSection title="Para qué los usamos">
        <p>
          Para operar el sitio, responder consultas, validar empresas de la red, generar
          cotizaciones y enviar comunicaciones que hayas solicitado. No vendemos datos personales.
        </p>
      </LegalSection>

      <LegalSection title="Con quién los compartimos">
        <p>
          Con proveedores de infraestructura necesarios para prestar el servicio (hosting, base de
          datos, almacenamiento de archivos) y, cuando iniciás una cotización, con la empresa de
          la red que corresponda.
        </p>
      </LegalSection>

      <LegalSection title="Conservación">
        <p>
          Conservamos los datos mientras exista una cuenta activa o una relación vigente, y luego
          por el plazo necesario para cumplir obligaciones legales.
        </p>
      </LegalSection>

      <LegalSection title="Tus derechos">
        <p>
          Podés solicitar acceso, rectificación, actualización o supresión de tus datos escribiendo
          desde la página de contacto. En Argentina, la Agencia de Acceso a la Información Pública
          es el organismo de control de la Ley 25.326.
        </p>
      </LegalSection>

      <LegalSection title="Seguridad">
        <p>
          Aplicamos controles de acceso, cifrado en tránsito y permisos por rol. Ningún sistema es
          infalible: si detectás un problema, avisanos.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
