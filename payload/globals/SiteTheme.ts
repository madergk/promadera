import type { GlobalConfig } from 'payload'
import { anyone, isAdmin } from '../access'

export const SiteTheme: GlobalConfig = {
  slug: 'site-theme',
  label: 'Tema del sitio',
  admin: {
    group: 'Sistema',
  },
  access: {
    read: anyone,
    update: isAdmin,
  },
  fields: [
    { name: 'colorPrimario', type: 'text' },
    { name: 'colorSecundario', type: 'text' },
    { name: 'logoClaro', type: 'upload', relationTo: 'media' },
    { name: 'logoOscuro', type: 'upload', relationTo: 'media' },
    { name: 'fuenteTitulos', type: 'text' },
    { name: 'fuenteCuerpo', type: 'text' },
  ],
}
