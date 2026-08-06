import type { CollectionConfig } from 'payload'
import { isAdminOrOwner, isAuthenticated } from '../access'

export const ProyectoDrafts: CollectionConfig = {
  slug: 'proyecto-drafts',
  labels: { singular: 'Borrador de proyecto', plural: 'Borradores de proyecto' },
  admin: {
    useAsTitle: 'id',
    group: 'Comercial',
    defaultColumns: ['user', 'wizardStep', 'updatedAt'],
  },
  access: {
    read: isAdminOrOwner,
    create: isAuthenticated,
    update: isAdminOrOwner,
    delete: isAdminOrOwner,
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'wizardStep', type: 'number', defaultValue: 0 },
    { name: 'brief', type: 'json' },
  ],
}
