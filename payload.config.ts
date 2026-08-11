import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './payload/collections/Users'
import { Media } from './payload/collections/Media'
import { Documentos } from './payload/collections/Documentos'
import { Empresas } from './payload/collections/Empresas'
import { Proyectos } from './payload/collections/Proyectos'
import { Noticias } from './payload/collections/Noticias'
import { BibliotecaRecursos } from './payload/collections/BibliotecaRecursos'
import { EducacionProgramas } from './payload/collections/EducacionProgramas'
import { AgendaEventos } from './payload/collections/AgendaEventos'
import { Cotizaciones } from './payload/collections/Cotizaciones'
import { CotizacionUpdates } from './payload/collections/CotizacionUpdates'
import { ProyectoDrafts } from './payload/collections/ProyectoDrafts'
import { ConsultasProveedores } from './payload/collections/ConsultasProveedores'
import { ConsultasContacto } from './payload/collections/ConsultasContacto'
import { SiteTheme } from './payload/globals/SiteTheme'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Documentos,
    Empresas,
    Proyectos,
    Noticias,
    BibliotecaRecursos,
    EducacionProgramas,
    AgendaEventos,
    Cotizaciones,
    CotizacionUpdates,
    ProyectoDrafts,
    ConsultasProveedores,
    ConsultasContacto,
  ],
  globals: [SiteTheme],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  plugins: [
    // En Vercel el filesystem es efímero y de solo lectura: los uploads van a Blob.
    // Sin token (desarrollo local) el plugin se desactiva y Payload usa disco.
    // NOTA: Documentos comparte por ahora el mismo store público que Media.
    // La privacidad hoy es solo a nivel de la API de Payload (access control
    // por dueño/admin en Documentos.ts y Empresas.documentos) — la URL del
    // archivo en Blob no es pública por descubrimiento normal, pero tampoco
    // está en un store con access=private real. Ver tarea de seguimiento
    // "Separar documentos privados de proveedores del store público".
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true, documentos: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  sharp,
})
