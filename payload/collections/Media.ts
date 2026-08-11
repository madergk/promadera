import type { Access, CollectionConfig } from 'payload'

/**
 * Sin dueño no hay forma de acotar update/delete a quien subió el archivo:
 * antes de este campo, "cualquier usuario autenticado" (default de Payload
 * cuando create/update/delete no están definidos) podía borrar CUALQUIER
 * imagen del sitio, no solo la suya — portadas de proyectos, logos de
 * empresas ajenas, todo. Mismo patrón que Documentos.subidoPor.
 */
const isOwnerOrAdmin: Access = async ({ req, id }) => {
  const { user } = req
  if (!user) return false
  if (user.role === 'admin') return true
  if (!id) return { uploadedBy: { equals: user.id } }

  const doc = await req.payload.findByID({ collection: 'media', id, depth: 0 }).catch(() => null)
  if (!doc) return false
  const uploadedById = typeof doc.uploadedBy === 'object' ? doc.uploadedBy?.id : doc.uploadedBy
  return uploadedById === user.id
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Archivo', plural: 'Archivos' },
  admin: {
    group: 'Sistema',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: isOwnerOrAdmin,
    delete: isOwnerOrAdmin,
  },
  hooks: {
    beforeChange: [
      ({ req, operation, data }) => {
        if (operation === 'create' && req.user) return { ...data, uploadedBy: req.user.id }
        return data
      },
    ],
  },
  upload: {
    staticDir: 'media',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar' },
      access: { update: () => false },
    },
  ],
}
