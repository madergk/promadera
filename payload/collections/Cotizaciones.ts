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
    defaultColumns: ['empresa', 'solicitante', 'tipoConsulta', 'estado', 'createdAt'],
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
      // Sin esto, cualquier usuario autenticado podía mandar un POST directo a
      // /api/cotizaciones con presupuestoArchivo/estado/presupuestoMonto/etc. ya
      // cargados (nada los bloqueaba a nivel de campo) — eso permitía, por
      // ejemplo, crear una cotización propia apuntando presupuestoArchivo al id
      // adivinado de OTRO cliente y leer ese PDF privado vía Documentos.canRead.
      // En creación: se descartan todos los campos que le corresponden solo al
      // proveedor o que se derivan del flujo de respuesta, y el solicitante
      // siempre sale de la sesión, nunca del body.
      //
      // En edición: cotizaciones.access.update (isParticipant) autoriza tanto al
      // solicitante como al dueño de la empresa a actualizar el documento, pero
      // sin esto cualquiera de los dos podía tocar CUALQUIER campo — el cliente
      // podía escribirse un presupuesto o una respuesta falsos, o el proveedor
      // podía reescribir la solicitud original. Acá se separa qué campo le
      // corresponde a cada lado.
      async ({ req, operation, data, originalDoc }) => {
        const { user } = req
        if (!user || user.role === 'admin') return data

        if (operation === 'create') {
          const {
            respuesta,
            respondidaAt,
            presupuestoMonto,
            presupuestoMoneda,
            presupuestoValidezDias,
            presupuestoPlazo,
            presupuestoArchivo,
            preferidaAt,
            avanceConfirmadoAt,
            ...allowed
          } = data
          return { ...allowed, solicitante: user.id, estado: 'enviada' }
        }

        if (operation === 'update' && originalDoc) {
          const empresaId =
            typeof originalDoc.empresa === 'object' ? originalDoc.empresa?.id : originalDoc.empresa
          const empresa = empresaId
            ? await req.payload.findByID({ collection: 'empresas', id: empresaId, depth: 0 }).catch(() => null)
            : null
          const empresaOwnerId = typeof empresa?.user === 'object' ? empresa?.user?.id : empresa?.user
          const isProveedor = empresaOwnerId === user.id
          const isSolicitante =
            (typeof originalDoc.solicitante === 'object'
              ? originalDoc.solicitante?.id
              : originalDoc.solicitante) === user.id

          const PROVEEDOR_ONLY = [
            'respuesta',
            'respondidaAt',
            'presupuestoMonto',
            'presupuestoMoneda',
            'presupuestoValidezDias',
            'presupuestoPlazo',
            'presupuestoArchivo',
          ]
          const SOLICITANTE_ONLY = ['preferidaAt', 'avanceConfirmadoAt']
          // Datos de la solicitud original: nadie los edita después de creada.
          const INMUTABLES = [
            'empresa',
            'solicitante',
            'tipoConsulta',
            'referencia',
            'descripcion',
            'cantidad',
            'plazo',
            'ubicacion',
            'presupuesto',
            'solicitanteNombre',
            'solicitanteEmail',
            'solicitanteTelefono',
            'solicitanteEmpresa',
          ]

          // Revertir al valor original, no borrar la key: `data` en un update
          // ya viene combinado con el resto del documento, así que borrar una
          // key requerida (ej. descripcion) hace que la validación de Payload
          // la vea "faltante" y rechace todo el update con 400.
          const original = originalDoc as Record<string, unknown>
          const next: Record<string, unknown> = { ...data }
          const revert = (f: string) => {
            next[f] = original[f]
          }
          if (!isProveedor) for (const f of PROVEEDOR_ONLY) revert(f)
          if (!isSolicitante) for (const f of SOLICITANTE_ONLY) revert(f)
          for (const f of INMUTABLES) revert(f)
          return next
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
