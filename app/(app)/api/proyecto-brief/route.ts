import { NextResponse } from 'next/server'
import { z } from 'zod'
import { APICallError, generateObject } from 'ai'
import { gateway } from '@ai-sdk/gateway'

import { getCurrentUser } from '@/lib/auth'

const MODEL = 'google/gemini-2.5-flash'

const briefSchema = z.object({
  resumen: z.string().describe('Brief de 2-3 frases describiendo el proyecto.'),
  estimaciones: z
    .array(z.string())
    .describe('3-5 viñetas cortas con materiales aprox, volúmenes y consideraciones técnicas.'),
  siguientes_pasos: z.array(z.string()).describe('3 viñetas con próximos pasos sugeridos.'),
  rubros: z
    .array(z.string())
    .describe(
      "3-6 categorías de proveedor relevantes, en minúsculas, ej: 'arquitectura', 'aserradero', 'vivienda industrializada', 'carpintería', 'estructuras', 'instalaciones'",
    ),
  descripcion_para_proveedor: z
    .string()
    .describe(
      'Texto listo para enviar como descripción de cotización (4-8 líneas), incluyendo alcance, ubicación, plazo y presupuesto si los hay.',
    ),
})

const bodySchema = z.object({
  tipo: z.enum(['vivienda', 'exterior']),
  subtipo: z.string().trim().min(1).max(120),
  superficie: z.string().trim().max(60).optional(),
  ubicacion: z.string().trim().max(120).optional(),
  plazo: z.string().trim().max(60).optional(),
  presupuesto: z.string().trim().max(60).optional(),
  terminaciones: z.array(z.string().max(60)).max(20).optional(),
  notas: z.string().trim().max(500).optional(),
})

const SYSTEM = `Sos un asistente técnico de Promadera que ayuda a particulares a planificar obras en madera (viviendas nuevas o construcciones exteriores como decks, pérgolas y quinchos).
Hablás en español rioplatense, tono claro y profesional, sin jerga innecesaria.
No inventes precios concretos en pesos; si mencionás presupuesto, usá rangos o decí "a confirmar".`

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 })

  const body = parsed.data
  const userPrompt = [
    `Tipo de obra: ${body.tipo === 'vivienda' ? 'Vivienda nueva en madera' : 'Construcción exterior'}`,
    `Subtipo: ${body.subtipo}`,
    body.superficie ? `Superficie aproximada: ${body.superficie}` : '',
    body.ubicacion ? `Ubicación: ${body.ubicacion}` : '',
    body.plazo ? `Plazo deseado: ${body.plazo}` : '',
    body.presupuesto ? `Presupuesto estimado: ${body.presupuesto}` : '',
    body.terminaciones?.length ? `Terminaciones / extras: ${body.terminaciones.join(', ')}` : '',
    body.notas ? `Notas del usuario: ${body.notas}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const { object } = await generateObject({
      model: gateway(MODEL),
      schema: briefSchema,
      system: SYSTEM,
      prompt: userPrompt,
    })
    return NextResponse.json(object)
  } catch (err) {
    console.error('proyecto-brief AI error:', err)
    if (err instanceof APICallError) {
      if (err.statusCode === 429) {
        return NextResponse.json({ error: 'rate_limit' }, { status: 429 })
      }
      if (err.statusCode === 402) {
        return NextResponse.json({ error: 'credits_exhausted' }, { status: 402 })
      }
    }
    return NextResponse.json({ error: 'ai_error' }, { status: 502 })
  }
}
