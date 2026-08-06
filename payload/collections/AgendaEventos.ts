import type { CollectionConfig } from 'payload'
import { isAdmin, readPublished } from '../access'

export const AgendaEventos: CollectionConfig = {
  slug: 'agenda-eventos',
  labels: { singular: 'Evento', plural: 'Agenda de eventos' },
  admin: {
    useAsTitle: 'titulo',
    group: 'Contenido',
    defaultColumns: ['titulo', 'fecha', 'publicado'],
  },
  access: {
    read: readPublished({ publicado: { equals: true } }),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    { name: 'fecha', type: 'date', required: true },
    { name: 'lugar', type: 'text' },
    { name: 'descripcion', type: 'textarea' },
    { name: 'publicado', type: 'checkbox', defaultValue: false },
  ],
}
