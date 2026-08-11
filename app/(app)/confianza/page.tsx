import type { Metadata } from 'next'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import {
  ShieldCheck,
  Lock,
  Database,
  Users,
  Cookie,
  Mail,
  AlertTriangle,
  Building2,
} from 'lucide-react'

const updated = '11 de agosto de 2026'

export const metadata: Metadata = {
  title: 'Confianza, seguridad y privacidad',
  description: 'Cómo Promadera protege tus datos, qué información recolecta y cómo ejercer tus derechos.',
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border border-border p-6 md:p-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="font-display text-xl">{title}</h2>
      </div>
      <div className="max-w-none space-y-3 leading-relaxed text-foreground/80">{children}</div>
    </section>
  )
}

export default function ConfianzaPage() {
  return (
    <div className="container-prose section max-w-4xl">
      <header className="mb-12">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-primary">Centro de confianza</p>
        <h1 className="mb-4 text-4xl md:text-5xl">Seguridad y privacidad</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Esta página la mantiene el equipo de Promadera para responder preguntas frecuentes sobre
          el manejo de datos, accesos y prácticas de seguridad del sitio.
        </p>
        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Última actualización: {updated}
        </p>
      </header>

      <div className="mb-10 flex gap-3 border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-foreground/60" />
        <p>
          Este documento es informativo y describe controles habilitados en la aplicación. No
          constituye una certificación independiente ni una garantía contractual. Para necesidades
          específicas (auditorías, acuerdos de tratamiento de datos), escribinos desde la página de{' '}
          <Link href="/contacto" className="underline">
            contacto
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-5">
        <Section icon={Building2} title="Quién está detrás">
          <p>
            Promadera es una iniciativa orientada a la construcción en madera, la industria
            forestal, la educación técnica y la inversión sustentable del ecosistema
            foresto-industrial de Corrientes.
          </p>
          <p>
            El sitio y los datos asociados son administrados por el equipo del programa. Para
            consultas sobre privacidad o seguridad, usá la{' '}
            <Link href="/contacto" className="underline">
              página de contacto
            </Link>
            .
          </p>
        </Section>

        <Section icon={Lock} title="Acceso y autenticación">
          <ul className="list-disc space-y-1 pl-5">
            <li>Las cuentas se crean con correo electrónico y contraseña.</li>
            <li>
              Las contraseñas se almacenan con hash (nunca en texto plano) y la sesión se
              identifica con una cookie de autenticación.
            </li>
            <li>
              Cada cuenta solo puede leer y modificar sus propios datos: las reglas de acceso se
              evalúan en el servidor en cada operación, no solo en la interfaz.
            </li>
          </ul>
        </Section>

        <Section icon={Database} title="Plataforma y alojamiento">
          <p>
            La aplicación corre sobre Next.js, desplegada en Vercel. Los datos estructurados viven
            en una base Postgres administrada (Neon) y los archivos (imágenes de obras, logos,
            documentación de proveedores) en almacenamiento de objetos (Vercel Blob). La
            infraestructura provee cifrado de datos en tránsito (HTTPS/TLS).
          </p>
          <p>
            La documentación de verificación que cargan los proveedores se guarda en una colección
            separada de las imágenes públicas del directorio, con reglas de acceso propias: solo
            la ve quien la subió, el equipo de revisión, o el cliente puntual al que corresponde
            una cotización.
          </p>
        </Section>

        <Section icon={Users} title="Qué datos recolectamos y para qué">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Cuenta:</strong> correo, nombre y, opcionalmente, teléfono, país, provincia,
              ciudad y organización, para personalizar la experiencia.
            </li>
            <li>
              <strong>Cotizaciones:</strong> los datos que ingresás en el formulario para que las
              empresas puedan responderte.
            </li>
            <li>
              <strong>Empresas/proveedores:</strong> datos públicos del directorio una vez
              publicados. La documentación de verificación no es pública.
            </li>
            <li>
              <strong>Contacto:</strong> los datos que dejás en el formulario de contacto, para
              poder responderte.
            </li>
          </ul>
          <p>No vendemos datos personales ni los compartimos con terceros para publicidad.</p>
        </Section>

        <Section icon={Cookie} title="Cookies y analítica">
          <p>
            Usamos una cookie necesaria para mantener tu sesión iniciada. El resto de las
            preferencias (por ejemplo, tu elección sobre cookies) se guardan en el almacenamiento
            local de tu navegador, no en cookies de terceros.
          </p>
          <p>
            La analítica de uso agregado del sitio no usa cookies de seguimiento ni identifica
            personas. Podés ver el detalle y cambiar tu elección en la{' '}
            <Link href="/cookies" className="underline">
              política de cookies
            </Link>
            .
          </p>
        </Section>

        <Section icon={ShieldCheck} title="Buenas prácticas que aplicamos">
          <ul className="list-disc space-y-1 pl-5">
            <li>Validación de entradas en todos los formularios para evitar contenido malicioso.</li>
            <li>
              Reglas de acceso por colección y por documento, evaluadas en el servidor: cada
              usuario solo ve y modifica lo suyo.
            </li>
            <li>
              Los campos de identidad de cada registro (quién lo creó, quién respondió) se fijan
              en el servidor a partir de la sesión activa; nunca se aceptan como dato enviado por
              el cliente.
            </li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Estas son prácticas vigentes en la aplicación; no representan una certificación formal
            de cumplimiento.
          </p>
        </Section>

        <Section icon={Mail} title="Reportar un problema de seguridad">
          <p>
            Si encontraste una vulnerabilidad o un comportamiento sospechoso, te pedimos
            divulgación responsable: contactanos desde{' '}
            <Link href="/contacto" className="underline">
              contacto
            </Link>{' '}
            describiendo el problema y los pasos para reproducirlo. Nos comprometemos a responder
            con la mayor brevedad posible y a no tomar acciones legales contra investigaciones
            realizadas de buena fe.
          </p>
        </Section>
      </div>

      <footer className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
        Esta página puede actualizarse a medida que evolucionan las prácticas del sitio. Las
        versiones publicadas anteriormente quedan reemplazadas por la versión más reciente.
      </footer>
    </div>
  )
}
