import type { CollectionConfig } from 'payload'
import { anyone, isAdmin } from '../access'

export const PROVINCIAS = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
] as const

export const RUBROS = [
  'Aserradero',
  'Constructora',
  'Carpintería / CLT',
  'Estudio de arquitectura',
  'Proveedor de insumos',
  'Logística',
  'Otro',
] as const

export const ConsultasProveedores: CollectionConfig = {
  slug: 'consultas-proveedores',
  labels: { singular: 'Consulta', plural: 'Consultas de proveedores' },
  admin: {
    useAsTitle: 'nombre',
    group: 'Comercial',
    defaultColumns: ['nombre', 'email', 'rubro', 'provincia', 'createdAt'],
  },
  access: {
    read: isAdmin,
    create: anyone,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'nombre', type: 'text', required: true, maxLength: 120 },
    { name: 'email', type: 'email', required: true },
    {
      name: 'rubro',
      type: 'select',
      required: true,
      options: RUBROS.map((r) => ({ label: r, value: r })),
    },
    {
      name: 'provincia',
      type: 'select',
      required: true,
      options: PROVINCIAS.map((p) => ({ label: p, value: p })),
    },
    { name: 'sitioWeb', type: 'text', maxLength: 255 },
    { name: 'mensaje', type: 'textarea', required: true, maxLength: 2000 },
  ],
}
