import type { CollectionConfig } from 'payload'
import { isAdmin, readPublished } from '../access'

export const EducacionProgramas: CollectionConfig = {
  slug: 'educacion-programas',
  labels: { singular: 'Programa', plural: 'Programas de educación' },
  admin: {
    useAsTitle: 'titulo',
    group: 'Contenido',
    defaultColumns: ['titulo', 'modalidad', 'publicado'],
  },
  access: {
    read: readPublished({ publicado: { equals: true } }),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    { name: 'descripcion', type: 'textarea' },
    {
      name: 'modalidad',
      type: 'select',
      options: [
        { label: 'Presencial', value: 'presencial' },
        { label: 'Virtual', value: 'virtual' },
        { label: 'Híbrido', value: 'hibrido' },
      ],
    },
    { name: 'duracion', type: 'text' },
    { name: 'publicado', type: 'checkbox', defaultValue: false },
  ],
}
