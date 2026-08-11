export interface NavItem {
  href: string
  label: string
  description?: string
  /** Enlace externo: se renderiza como <a> y abre en pestaña nueva. */
  external?: boolean
}

export interface NavGroup {
  theme: string
  description: string
  /** Si está seteado, el grupo es un link directo en vez de un dropdown. */
  href?: string
  items: NavItem[]
}

/** Acceso principal: las cuatro puertas de entrada del sitio. */
export interface Acceso extends NavItem {
  question: string
  copy: string
}

export const accesos: Acceso[] = [
  {
    href: '/simulador',
    label: 'Simulá tu proyecto',
    question: '¿Cuánto cuesta y cuánto tarda?',
    copy: 'Costo y plazos estimados, en minutos.',
    description: 'Costo y plazos según metros, tipología y sistema.',
  },
  {
    href: '/proveedores',
    label: 'Proveedores',
    question: '¿Quién me lo construye, con garantías?',
    copy: 'Constructoras certificadas en tu zona.',
    description: 'Directorio de la red PROMADERA.',
  },
  {
    href: '/proyectos',
    label: 'Inspirate',
    question: '¿Cómo se ve una casa de madera bien hecha?',
    copy: 'Casas reales construidas por la red.',
    description: 'Fotos, metros, sistema y constructora.',
  },
  {
    href: '/aprende',
    label: 'Aprendé',
    question: '¿Es seguro y sustentable?',
    copy: 'Lo esencial antes de construir en madera.',
    description: 'CIRSOC 601, seguridad, aislación y sustentabilidad.',
  },
]

/** Navegación principal del header: tres ítems + CTA. */
export const primaryNav: NavItem[] = [
  { href: '/simulador', label: 'Simulá tu proyecto' },
  { href: '/proveedores', label: 'Proveedores' },
  { href: '/aprende', label: 'Aprendé' },
]

export const navGroups: NavGroup[] = [
  {
    theme: 'Empezá acá',
    description: 'Las cuatro puertas de entrada.',
    items: accesos.map(({ href, label, description }) => ({ href, label, description })),
  },
  {
    theme: 'Para empresas',
    description: 'Sistemas PROMADERA para empresas.',
    href: '/empresas',
    items: [
      { href: '/empresas', label: 'Sistemas PROMADERA', description: 'BIM, AI, FAB y FORMA.' },
      {
        href: '/proveedores/alta',
        label: 'Sumá tu empresa a la red',
        description: 'Publicá tu perfil en la red.',
      },
    ],
  },
  {
    theme: 'Institucional',
    description: 'Quiénes somos y cómo contactarnos.',
    items: [
      { href: '/nosotros', label: 'Quiénes somos', description: 'Una Systems Company.' },
      {
        href: 'https://www.maderacorrentina.com',
        label: 'Programa Madera Correntina',
        description: 'Sitio oficial del programa.',
        external: true,
      },
      { href: '/contacto', label: 'Contacto', description: 'Asistencia técnica e institucional.' },
    ],
  },
]

/** Grupo adicional para /mapa-del-sitio únicamente — no forma parte del mega-menú del header. */
export const legalGroup: NavGroup = {
  theme: 'Legal',
  description: 'Documentos legales y mapa del sitio.',
  items: [
    { href: '/privacidad', label: 'Privacidad', description: 'Qué datos recolectamos y por qué.' },
    { href: '/terminos', label: 'Términos', description: 'Condiciones de uso del sitio.' },
    { href: '/cookies', label: 'Cookies', description: 'Qué cookies usamos y cómo cambiarlas.' },
    { href: '/confianza', label: 'Confianza', description: 'Seguridad y privacidad en detalle.' },
    { href: '/mapa-del-sitio', label: 'Mapa del sitio', description: 'Todas las secciones, agrupadas.' },
  ],
}

/** Rutas privadas: sólo visibles en el menú de cuenta, con sesión iniciada. */
export const accountNav: NavItem[] = [
  { href: '/perfil', label: 'Mi perfil' },
  { href: '/mis-cotizaciones', label: 'Mis cotizaciones' },
  { href: '/panel-proveedor', label: 'Panel del proveedor' },
  { href: '/proveedores/alta', label: 'Sumar mi empresa' },
]
