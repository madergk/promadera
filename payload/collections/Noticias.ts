import type { CollectionConfig } from 'payload'
import { isAdmin, readPublished } from '../access'

export const Noticias: CollectionConfig = {
  slug: 'noticias',
  labels: { singular: 'Noticia', plural: 'Noticias' },
  admin: {
    useAsTitle: 'titulo',
    group: 'Contenido',
    defaultColumns: ['titulo', 'categoria', 'destacada', 'publicada'],
  },
  access: {
    read: readPublished({ publicada: { equals: true } }),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'resumen', type: 'textarea' },
    { name: 'contenido', type: 'richText' },
    { name: 'categoria', type: 'text' },
    { name: 'autor', type: 'text' },
    { name: 'imagen', type: 'upload', relationTo: 'media' },
    { name: 'destacada', type: 'checkbox', defaultValue: false },
    { name: 'publicada', type: 'checkbox', defaultValue: false },
  ],
}
