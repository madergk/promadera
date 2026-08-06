import type { CollectionConfig } from 'payload'
import { isAdmin, readPublished } from '../access'

export const Proyectos: CollectionConfig = {
  slug: 'proyectos',
  labels: { singular: 'Proyecto', plural: 'Proyectos' },
  admin: {
    useAsTitle: 'titulo',
    group: 'Directorio',
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
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'categoria', type: 'text' },
    {
      name: 'materiales',
      type: 'array',
      fields: [{ name: 'material', type: 'text', required: true }],
    },
    { name: 'empresas', type: 'relationship', relationTo: 'empresas', hasMany: true },
    { name: 'galeria', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'publicado', type: 'checkbox', defaultValue: false },
  ],
}
