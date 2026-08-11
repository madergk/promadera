import type { CollectionConfig } from 'payload'
import { isAdminOrOwner, isAuthenticated } from '../access'

export const TERMINACIONES = [
  'Aislación térmica',
  'Cubierta de chapa',
  'Cubierta de tejas',
  'Aberturas de aluminio',
  'Aberturas de madera',
  'Instalación eléctrica',
  'Instalación sanitaria',
  'Calefacción / estufa',
] as const

export const ProyectoDrafts: CollectionConfig = {
  slug: 'proyecto-drafts',
  labels: { singular: 'Borrador de proyecto', plural: 'Borradores de proyecto' },
  admin: {
    useAsTitle: 'titulo',
    group: 'Comercial',
    defaultColumns: ['user', 'titulo', 'wizardStep', 'updatedAt'],
  },
  access: {
    read: isAdminOrOwner,
    create: isAuthenticated,
    update: isAdminOrOwner,
    delete: isAdminOrOwner,
  },
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        if (operation === 'create' && req.user) {
          data.user = req.user.id
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'refSlug', type: 'text', maxLength: 200 },
    { name: 'titulo', type: 'text', maxLength: 200 },
    { name: 'wizardStep', type: 'number', defaultValue: 0 },
    {
      name: 'tipo',
      type: 'select',
      options: [
        { label: 'Vivienda nueva en madera', value: 'vivienda' },
        { label: 'Construcción exterior', value: 'exterior' },
      ],
    },
    { name: 'subtipo', type: 'text', maxLength: 60 },
    { name: 'superficie', type: 'text', maxLength: 60 },
    { name: 'ubicacion', type: 'text', maxLength: 120 },
    { name: 'plazo', type: 'text', maxLength: 60 },
    { name: 'presupuesto', type: 'text', maxLength: 60 },
    {
      name: 'terminaciones',
      type: 'array',
      fields: [{ name: 'valor', type: 'text', required: true }],
    },
    { name: 'notas', type: 'textarea', maxLength: 500 },
    { name: 'brief', type: 'json' },
  ],
}
