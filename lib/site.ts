/**
 * El sitio se considera indexable solo cuando SITE_INDEXABLE === 'true'.
 *
 * Mientras la migración está en curso el sitio vive en una URL pública
 * (el plan actual de Vercel no permite proteger producción con Vercel
 * Authentication ni con contraseña), así que al menos se lo mantiene
 * fuera de los buscadores. Al lanzar: setear SITE_INDEXABLE=true.
 */
export const isIndexable = process.env.SITE_INDEXABLE === 'true'
