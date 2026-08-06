import type { Access, CollectionConfig, Where } from 'payload'
import { isAdmin } from '../access'

const isCotizacionParticipant = async (req: any, cotizacionId: unknown): Promise<boolean> => {
  const { user } = req
  if (!user) return false
  if (user.role === 'admin') return true
  if (!cotizacionId) return false

  const id = typeof cotizacionId === 'object' ? (cotizacionId as any)?.id : cotizacionId
  const cotizacion = await req.payload.findByID({ collection: 'cotizaciones', id, depth: 0 })
  if (!cotizacion) return false
  if (cotizacion.solicitante === user.id) return true

  const empresa = await req.payload.findByID({
    collection: 'empresas',
    id: cotizacion.empresa,
    depth: 0,
  })
  return empresa?.user === user.id
}

const readUpdates: Access = ({ req }) => {
  const { user } = req
  if (!user) return false
  if (user.role === 'admin') return true
  const where: Where = {
    or: [
      { 'cotizacion.solicitante': { equals: user.id } },
      { 'cotizacion.empresa.user': { equals: user.id } },
    ],
  }
  return where
}

export const CotizacionUpdates: CollectionConfig = {
  slug: 'cotizacion-updates',
  labels: { singular: 'Mensaje de cotización', plural: 'Mensajes de cotización' },
  admin: {
    useAsTitle: 'id',
    group: 'Comercial',
    defaultColumns: ['cotizacion', 'autor', 'createdAt'],
  },
  access: {
    read: readUpdates,
    create: async ({ req, data }) => {
      if (!req.user) return false
      return isCotizacionParticipant(req, data?.cotizacion)
    },
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'cotizacion', type: 'relationship', relationTo: 'cotizaciones', required: true },
    { name: 'autor', type: 'relationship', relationTo: 'users', required: true },
    { name: 'mensaje', type: 'textarea', required: true },
  ],
}
