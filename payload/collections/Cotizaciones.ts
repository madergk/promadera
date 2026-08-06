import type { Access, CollectionConfig, Where } from 'payload'
import { isAdmin, isAuthenticated } from '../access'

const isParticipant = async ({
  req,
  doc,
}: {
  req: { user: any; payload: any }
  doc?: any
}): Promise<boolean> => {
  const { user } = req
  if (!user) return false
  if (user.role === 'admin') return true
  if (doc?.solicitante === user.id || doc?.solicitante?.id === user.id) return true

  const empresaId = typeof doc?.empresa === 'object' ? doc?.empresa?.id : doc?.empresa
  if (!empresaId) return false
  const empresa = await req.payload.findByID({
    collection: 'empresas',
    id: empresaId,
    depth: 0,
  })
  const ownerId = typeof empresa?.user === 'object' ? empresa?.user?.id : empresa?.user
  return ownerId === user.id
}

const readCotizaciones: Access = ({ req }) => {
  const { user } = req
  if (!user) return false
  if (user.role === 'admin') return true
  const where: Where = {
    or: [{ solicitante: { equals: user.id } }, { 'empresa.user': { equals: user.id } }],
  }
  return where
}

export const Cotizaciones: CollectionConfig = {
  slug: 'cotizaciones',
  labels: { singular: 'Cotización', plural: 'Cotizaciones' },
  admin: {
    useAsTitle: 'id',
    group: 'Comercial',
    defaultColumns: ['empresa', 'solicitante', 'status', 'createdAt'],
  },
  access: {
    read: readCotizaciones,
    create: isAuthenticated,
    update: async ({ req, id }) => {
      if (!id) return Boolean(req.user)
      const doc = await req.payload.findByID({ collection: 'cotizaciones', id, depth: 0 })
      return isParticipant({ req, doc })
    },
    delete: isAdmin,
  },
  fields: [
    { name: 'empresa', type: 'relationship', relationTo: 'empresas', required: true },
    { name: 'solicitante', type: 'relationship', relationTo: 'users', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pendiente',
      options: [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Respondida', value: 'respondida' },
        { label: 'Aceptada', value: 'aceptada' },
        { label: 'Rechazada', value: 'rechazada' },
        { label: 'Cerrada', value: 'cerrada' },
      ],
    },
    { name: 'mensaje', type: 'textarea' },
    { name: 'presupuesto', type: 'number' },
    { name: 'respuesta', type: 'textarea' },
  ],
}
