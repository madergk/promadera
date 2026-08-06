import type { Access, FieldAccess, Where } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => Boolean(user && user.role === 'admin')

export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) =>
  Boolean(user && user.role === 'admin')

export const isAuthenticated: Access = ({ req: { user } }) => Boolean(user)

export const anyone: Access = () => true

/** Owner es dueño del registro vía relationship `user`, o admin. */
export const isAdminOrOwner: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  return { user: { equals: user.id } }
}

/** Lectura pública solo de contenido publicado; admin y dueño ven todo. */
export const readPublishedOrOwner = (publishedWhere: Where): Access => {
  return ({ req: { user } }) => {
    if (!user) return publishedWhere
    if (user.role === 'admin') return true
    const where: Where = {
      or: [publishedWhere, { user: { equals: user.id } }],
    }
    return where
  }
}

/** Lectura pública solo de contenido publicado; sin excepción de owner (contenido editorial admin-only). */
export const readPublished = (publishedWhere: Where): Access => {
  return ({ req: { user } }) => {
    if (!user) return publishedWhere
    if (user.role === 'admin') return true
    return publishedWhere
  }
}

/** Campo visible solo para el dueño del registro (relationship `user`) o admin. */
export const ownerOrAdminFieldLevel: FieldAccess = ({ req: { user }, doc }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  const ownerId = typeof doc?.user === 'object' ? doc?.user?.id : doc?.user
  return ownerId === user.id
}
