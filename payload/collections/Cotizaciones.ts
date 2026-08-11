import type { Access, CollectionConfig, Where } from 'payload'
import { isAdmin, isAuthenticated } from '../access'

/** Ciclo de vida de una cotización, igual al del sitio original. */
export const ESTADOS_COTIZACION = [
  {
    value: 'enviada',
    label: 'Enviada',
    description: 'Recibimos tu solicitud y la derivamos al proveedor.',
  },
  {
    value: 'en_revision',
    label: 'En revisión',
    description: 'El proveedor está analizando tu consulta.',
  },
  {
    value: 'respondida',
    label: 'Respondida',
    description: 'Recibiste una respuesta del proveedor.',
  },
  { value: 'cerrada', label: 'Cerrada', description: 'La cotización fue cerrada.' },
  {
    value: 'cancelada',
    label: 'Cancelada',
    description: 'Cancelaste esta solicitud antes de recibir respuesta.',
  },
] as const

export type EstadoCotizacion = (typeof ESTADOS_COTIZACION)[number]['value']

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
    defaultColumns: ['empresa', 'solicitante', 'tipoConsulta', 'status', 'createdAt'],
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
  hooks: {
    beforeChange: [
      // El solicitante siempre es quien crea la cotización; nunca se toma del body
      // (evita crear solicitudes a nombre de otro usuario).
      ({ req, operation, data }) => {
        if (operation === 'create' && req.user && req.user.role !== 'admin') {
          return { ...data, solicitante: req.user.id }
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'empresa', type: 'relationship', relationTo: 'empresas', required: true },
    { name: 'solicitante', type: 'relationship', relationTo: 'users', required: true },
    {
      name: 'tipoConsulta',
      type: 'select',
      required: true,
      defaultValue: 'proyecto',
      options: [
        { label: 'Producto del catálogo', value: 'producto' },
        { label: 'Servicio', value: 'servicio' },
        { label: 'Proyecto a medida', value: 'proyecto' },
      ],
    },
    { name: 'referencia', type: 'text', maxLength: 200 },
    { name: 'descripcion', type: 'textarea', required: true, maxLength: 2000 },
    { name: 'cantidad', type: 'text', maxLength: 120 },
    { name: 'plazo', type: 'text', maxLength: 120 },
    { name: 'ubicacion', type: 'text', maxLength: 160 },
    { name: 'presupuesto', type: 'text', maxLength: 120 },
    { name: 'solicitanteNombre', type: 'text', required: true, maxLength: 120 },
    { name: 'solicitanteEmail', type: 'email', required: true },
    { name: 'solicitanteTelefono', type: 'text', maxLength: 60 },
    { name: 'solicitanteEmpresa', type: 'text', maxLength: 160 },
    {
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'enviada',
      options: ESTADOS_COTIZACION.map((e) => ({ label: e.label, value: e.value })),
    },
    { name: 'respuesta', type: 'textarea' },
    { name: 'respondidaAt', type: 'date' },
    // Presupuesto que carga el proveedor al responder.
    { name: 'presupuestoMonto', type: 'number' },
    {
      name: 'presupuestoMoneda',
      type: 'select',
      options: [
        { label: 'ARS', value: 'ARS' },
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
      ],
    },
    { name: 'presupuestoValidezDias', type: 'number' },
    { name: 'presupuestoPlazo', type: 'text', maxLength: 120 },
    // Documentos (privado), no Media: lo ve solo el solicitante de esta cotización.
    { name: 'presupuestoArchivo', type: 'relationship', relationTo: 'documentos' },
    // Marcas del solicitante sobre la propuesta recibida.
    { name: 'preferidaAt', type: 'date' },
    { name: 'avanceConfirmadoAt', type: 'date' },
  ],
}
