import type { CollectionConfig } from 'payload'
import { isAdmin, readPublished } from '../access'

export const BibliotecaRecursos: CollectionConfig = {
  slug: 'biblioteca-recursos',
  labels: { singular: 'Recurso', plural: 'Biblioteca de recursos' },
  admin: {
    useAsTitle: 'titulo',
    group: 'Contenido',
    defaultColumns: ['titulo', 'categoria', 'publicado'],
  },
  access: {
    read: readPublished({ publicado: { equals: true } }),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    { name: 'categoria', type: 'text' },
    { name: 'archivo', type: 'upload', relationTo: 'media', required: true },
    { name: 'paginas', type: 'number' },
    { name: 'publicado', type: 'checkbox', defaultValue: false },
  ],
}
