import type { Metadata } from 'next'
import { Mail, MapPin, Phone } from 'lucide-react'

import { PageHeader } from '@/components/shared/page-header'
import { FormularioContacto } from '@/components/contacto/formulario-contacto'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contactá con el equipo de Promadera.',
}

export default function ContactoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Hablemos"
        title="Estamos para acompañar tu próximo proyecto."
        description="Consultas institucionales, prensa, oportunidades de inversión y solicitudes de información."
      />
      <section className="section">
        <div className="container-wide grid gap-12 lg:grid-cols-12">
          <FormularioContacto />

          <aside className="space-y-8 lg:col-span-5 lg:border-l lg:border-border lg:pl-12">
            <div>
              <p className="text-eyebrow mb-3 text-primary">Sede institucional</p>
              <div className="space-y-3 text-sm">
                <p className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-accent" />
                  <span>
                    25 de Mayo 1132
                    <br />
                    Ciudad de Corrientes, Argentina
                  </span>
                </p>
                <p className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-accent" />
                  +54 379 444 0000
                </p>
                <p className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-accent" />
                  info@maderacorrentina.gob.ar
                </p>
              </div>
            </div>
            <div>
              <p className="text-eyebrow mb-3 text-primary">Horarios</p>
              <p className="text-sm text-muted-foreground">Lunes a viernes · 8:00 a 16:00</p>
            </div>
            <div>
              <p className="text-eyebrow mb-3 text-primary">Áreas</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Inversiones: inversiones@maderacorrentina.gob.ar</li>
                <li>Prensa: prensa@maderacorrentina.gob.ar</li>
                <li>Educación: formacion@maderacorrentina.gob.ar</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
