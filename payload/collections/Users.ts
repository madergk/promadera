import type { CollectionConfig, Where } from 'payload'
import { isAdmin, isAdminFieldLevel } from '../access'

export const PROFILE_TYPES = [
  { value: 'empresa', label: 'Empresa / Comprador' },
  { value: 'particular', label: 'Particular' },
  { value: 'inversor', label: 'Inversor' },
  { value: 'productor', label: 'Productor forestal' },
  { value: 'estudiante', label: 'Estudiante / Investigador' },
] as const

export type ProfileType = (typeof PROFILE_TYPES)[number]['value']

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuario', plural: 'Usuarios' },
  admin: {
    useAsTitle: 'email',
    group: 'Sistema',
    defaultColumns: ['email', 'nombreCompleto', 'role', 'onboarded'],
  },
  auth: true,
  access: {
    // Solo un admin puede entrar al panel de Payload.
    admin: ({ req: { user } }) => Boolean(user && user.role === 'admin'),
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      const where: Where = { id: { equals: user.id } }
      return where
    },
    // El alta pública NO pasa por REST: se hace desde el server action de /auth
    // usando la Local API, que fuerza role='cliente'. Así se cierra la vía
    // POST /api/users con role='admin'.
    create: isAdmin,
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      const where: Where = { id: { equals: user.id } }
      return where
    },
    delete: isAdmin,
  },
  fields: [
    { name: 'nombreCompleto', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'cliente',
      access: {
        // Impide que un usuario se auto-promueva editando su propio perfil.
        update: isAdminFieldLevel,
      },
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Proveedor', value: 'proveedor' },
        { label: 'Cliente', value: 'cliente' },
      ],
    },
    { name: 'onboarded', type: 'checkbox', defaultValue: false },
    {
      name: 'profileType',
      type: 'select',
      options: PROFILE_TYPES.map((p) => ({ label: p.label, value: p.value })),
    },
    { name: 'telefono', type: 'text', maxLength: 30 },
    { name: 'organizacion', type: 'text', maxLength: 150 },
    { name: 'pais', type: 'text', maxLength: 80 },
    { name: 'provincia', type: 'text', maxLength: 80 },
    { name: 'ciudad', type: 'text', maxLength: 80 },
    {
      name: 'intereses',
      type: 'array',
      fields: [{ name: 'interes', type: 'text', required: true }],
    },
    { name: 'notas', type: 'textarea', maxLength: 500 },
  ],
}
