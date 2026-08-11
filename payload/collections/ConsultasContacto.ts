import type { CollectionConfig } from 'payload'
import { anyone, isAdmin } from '../access'

export const ConsultasContacto: CollectionConfig = {
  slug: 'consultas-contacto',
  labels: { singular: 'Consulta de contacto', plural: 'Consultas de contacto' },
  admin: {
    useAsTitle: 'asunto',
    group: 'Comercial',
    defaultColumns: ['nombre', 'email', 'asunto', 'createdAt'],
  },
  access: {
    read: isAdmin,
    create: anyone,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'nombre', type: 'text', required: true, maxLength: 100 },
    { name: 'email', type: 'email', required: true },
    { name: 'organizacion', type: 'text', maxLength: 200 },
    { name: 'asunto', type: 'text', required: true, maxLength: 200 },
    { name: 'mensaje', type: 'textarea', required: true, maxLength: 2000 },
  ],
}
