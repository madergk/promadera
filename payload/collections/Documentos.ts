import type { Access, CollectionConfig } from 'payload'
import { isAdmin, isAuthenticated } from '../access'

/**
 * Documentación institucional de proveedores (certificaciones, brochures).
 * Colección separada de Media a propósito: nunca debe quedar en el store
 * público de Blob. El dueño es quien la sube (empresa se asigna después,
 * al guardar el alta) o un admin.
 */
const isOwnerOrAdmin: Access = async ({ req, id }) => {
  const { user } = req
  if (!user) return false
  if (user.role === 'admin') return true
  if (!id) return { subidoPor: { equals: user.id } }

  const doc = await req.payload.findByID({ collection: 'documentos', id, depth: 0 }).catch(() => null)
  if (!doc) return false
  const subidoPorId = typeof doc.subidoPor === 'object' ? doc.subidoPor?.id : doc.subidoPor
  return subidoPorId === user.id
}

/**
 * Lectura: dueño (quien lo subió), admin, o el solicitante de una cotización
 * que adjuntó este documento como presupuesto (el proveedor lo sube, pero
 * es el cliente quien necesita poder verlo).
 */
const canRead: Access = async (args) => {
  const ownerCheck = await isOwnerOrAdmin(args)
  if (ownerCheck) return ownerCheck

  const { req, id } = args
  const { user } = req
  if (!user || !id) return false

  const { totalDocs } = await req.payload.find({
    collection: 'cotizaciones',
    where: { and: [{ presupuestoArchivo: { equals: id } }, { solicitante: { equals: user.id } }] },
    limit: 1,
    depth: 0,
  })
  return totalDocs > 0
}

export const Documentos: CollectionConfig = {
  slug: 'documentos',
  labels: { singular: 'Documento', plural: 'Documentos' },
  admin: {
    useAsTitle: 'nombre',
    group: 'Directorio',
  },
  access: {
    read: canRead,
    create: isAuthenticated,
    update: isOwnerOrAdmin,
    delete: isOwnerOrAdmin,
  },
  upload: {
    staticDir: 'documentos',
    mimeTypes: ['application/pdf'],
  },
  fields: [
    { name: 'nombre', type: 'text', required: true },
    {
      name: 'empresa',
      type: 'relationship',
      relationTo: 'empresas',
      admin: { position: 'sidebar' },
    },
    {
      name: 'subidoPor',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar' },
      access: { update: () => false },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, operation, data }) => {
        if (operation === 'create' && req.user) return { ...data, subidoPor: req.user.id }
        return data
      },
    ],
  },
}
