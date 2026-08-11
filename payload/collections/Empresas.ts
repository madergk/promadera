import type { CollectionConfig, Where } from 'payload'
import { isAdmin, isAdminOrOwner, isAuthenticated, ownerOrAdminFieldLevel } from '../access'

const PUBLISHED_WHERE: Where = {
  and: [{ publicada: { equals: true } }, { estado: { equals: 'publicado' } }],
}

export const Empresas: CollectionConfig = {
  slug: 'empresas',
  labels: { singular: 'Empresa', plural: 'Empresas' },
  admin: {
    useAsTitle: 'nombre',
    group: 'Directorio',
    defaultColumns: ['nombre', 'sector', 'tipoProveedor', 'estado', 'publicada'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return PUBLISHED_WHERE
      if (user.role === 'admin') return true
      const where: Where = { or: [PUBLISHED_WHERE, { user: { equals: user.id } }] }
      return where
    },
    create: isAuthenticated,
    update: isAdminOrOwner,
    delete: isAdmin,
  },
  fields: [
    { name: 'nombre', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'sector', type: 'text' },
    { name: 'descripcion', type: 'textarea' },
    { name: 'ubicacion', type: 'text' },
    {
      name: 'tipoProveedor',
      type: 'select',
      options: [
        { label: 'Empresa / Comercializadora', value: 'empresa' },
        { label: 'Productor forestal', value: 'productor' },
        { label: 'Industrial / Aserradero', value: 'industrial' },
        { label: 'Profesional independiente', value: 'profesional' },
      ],
    },
    {
      name: 'servicios',
      type: 'array',
      fields: [{ name: 'servicio', type: 'text', required: true }],
    },
    {
      name: 'serviciosDetalle',
      type: 'array',
      fields: [
        { name: 'servicio', type: 'text', required: true },
        { name: 'detalle', type: 'textarea' },
      ],
    },
    {
      name: 'productos',
      type: 'array',
      fields: [
        { name: 'nombre', type: 'text', required: true },
        { name: 'descripcion', type: 'textarea' },
        { name: 'imagen', type: 'upload', relationTo: 'media' },
      ],
    },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'galeria', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'sitioWeb', type: 'text' },
    { name: 'anioFundacion', type: 'number' },
    { name: 'empleados', type: 'text' },
    {
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'borrador',
      options: [
        { label: 'Borrador', value: 'borrador' },
        { label: 'En revisión', value: 'en_revision' },
        { label: 'Publicado', value: 'publicado' },
        { label: 'Archivado', value: 'archivado' },
      ],
    },
    { name: 'publicada', type: 'checkbox', defaultValue: false },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar' },
    },
    // Campos sensibles — solo visibles para el dueño o un admin (equivalente a la RLS de Supabase)
    { name: 'contacto', type: 'text', access: { read: ownerOrAdminFieldLevel } },
    { name: 'telefono', type: 'text', access: { read: ownerOrAdminFieldLevel } },
    { name: 'whatsapp', type: 'text', access: { read: ownerOrAdminFieldLevel } },
    // Documentación institucional: colección separada (ver Documentos.ts), nunca
    // el store público de Media — ningún campo acá expone la URL del archivo.
    {
      name: 'documentos',
      type: 'relationship',
      relationTo: 'documentos',
      hasMany: true,
      access: { read: ownerOrAdminFieldLevel },
    },
    {
      name: 'consentimientos',
      type: 'group',
      access: { read: ownerOrAdminFieldLevel },
      fields: [
        { name: 'terminosAceptados', type: 'checkbox', defaultValue: false },
        { name: 'comunicacionesAceptadas', type: 'checkbox', defaultValue: false },
        { name: 'version', type: 'text' },
        { name: 'fechaConsentimiento', type: 'date' },
      ],
    },
  ],
}
