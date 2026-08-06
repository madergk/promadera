import type { CollectionConfig } from 'payload'
import { isAdmin, readPublished } from '../access'

export const CATEGORIAS_PROYECTO = [
  'Vivienda',
  'Comercial',
  'Institucional',
  'Industrial',
  'Turismo',
] as const

export const Proyectos: CollectionConfig = {
  slug: 'proyectos',
  labels: { singular: 'Proyecto', plural: 'Proyectos' },
  admin: {
    useAsTitle: 'titulo',
    group: 'Directorio',
    defaultColumns: ['titulo', 'categoria', 'anio', 'publicado'],
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
    { name: 'resumen', type: 'textarea' },
    { name: 'descripcion', type: 'textarea' },
    {
      name: 'categoria',
      type: 'select',
      options: CATEGORIAS_PROYECTO.map((c) => ({ label: c, value: c })),
    },
    { name: 'ubicacion', type: 'text' },
    { name: 'anio', type: 'number' },
    { name: 'arquitecto', type: 'text' },
    // "constructora" y no "constructor": ese nombre choca con Object.prototype.constructor
    // en los docs de la Local API y produce truthys fantasma.
    { name: 'constructora', type: 'text' },
    { name: 'sistemaConstructivo', type: 'text' },
    { name: 'impactoCarbono', type: 'text' },
    {
      name: 'materiales',
      type: 'array',
      fields: [{ name: 'material', type: 'text', required: true }],
    },
    { name: 'empresas', type: 'relationship', relationTo: 'empresas', hasMany: true },
    { name: 'portada', type: 'upload', relationTo: 'media' },
    { name: 'galeria', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'publicado', type: 'checkbox', defaultValue: false },
  ],
}
