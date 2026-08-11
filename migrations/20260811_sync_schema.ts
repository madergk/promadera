import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Migración escrita a mano, no generada por `payload migrate:create`.
 *
 * Motivo: el CLI de Payload/drizzle-kit pregunta interactivamente si cada
 * columna/enum eliminado es un "rename" de uno nuevo cuando la forma es
 * ambigua (ej: Users.ubicacion se borra mientras se agregan 5 columnas
 * varchar nuevas; Cotizaciones.status → estado cambia de nombre Y de
 * valores de enum a la vez). Ninguna sesión no interactiva puede responder
 * esas preguntas, y no hay datos reales en producción que preservar
 * (el sitio todavía está detrás de Vercel Authentication, sin lanzar) —
 * así que se optó por escribir el delta a mano, tratando cada cambio
 * como "columna nueva" en vez de intentar renames que además cambiarían
 * de tipo. Valores de enum viejos (ej. 'rechazado', 'fabricante') quedan
 * como opciones muertas en el tipo de Postgres: no rompen nada, Payload
 * nunca las va a escribir porque ya no están en las opciones del campo.
 *
 * Cubre el delta desde 20260806_035335_initial.ts hasta el schema actual:
 * - Users: +organizacion/pais/provincia/ciudad/notas/intereses,
 *   -ubicacion, profileType pasa de texto libre a select.
 * - Cotizaciones: status→estado (nuevo vocabulario), +presupuesto*,
 *   +preferidaAt/avanceConfirmadoAt.
 * - Documentos: colección nueva (uploads privados de proveedores).
 * - Empresas: +valores de enum estado/tipoProveedor, documentos pasa de
 *   array a relationship hacia Documentos, +consentimientos.
 * - CotizacionUpdates: +accion/estadoAnterior/estadoNuevo, mensaje deja
 *   de ser obligatorio.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  -- Enums nuevos
  CREATE TYPE "public"."enum_users_profile_type" AS ENUM('empresa', 'particular', 'inversor', 'productor', 'estudiante');
  CREATE TYPE "public"."enum_cotizaciones_estado" AS ENUM('enviada', 'en_revision', 'respondida', 'cerrada', 'cancelada');
  CREATE TYPE "public"."enum_cotizaciones_presupuesto_moneda" AS ENUM('ARS', 'USD', 'EUR');
  CREATE TYPE "public"."enum_cotizacion_updates_accion" AS ENUM('mensaje', 'estado', 'presupuesto_borrador', 'presupuesto_enviado');
  CREATE TYPE "public"."enum_cotizacion_updates_estado_anterior" AS ENUM('enviada', 'en_revision', 'respondida', 'cerrada', 'cancelada');
  CREATE TYPE "public"."enum_cotizacion_updates_estado_nuevo" AS ENUM('enviada', 'en_revision', 'respondida', 'cerrada', 'cancelada');

  -- Valores nuevos en enums existentes (los viejos quedan como opciones muertas, sin uso)
  ALTER TYPE "public"."enum_empresas_estado" ADD VALUE IF NOT EXISTS 'archivado';
  ALTER TYPE "public"."enum_empresas_tipo_proveedor" ADD VALUE IF NOT EXISTS 'empresa';
  ALTER TYPE "public"."enum_empresas_tipo_proveedor" ADD VALUE IF NOT EXISTS 'productor';
  ALTER TYPE "public"."enum_empresas_tipo_proveedor" ADD VALUE IF NOT EXISTS 'industrial';
  ALTER TYPE "public"."enum_empresas_tipo_proveedor" ADD VALUE IF NOT EXISTS 'profesional';

  -- Users
  ALTER TABLE "users" ADD COLUMN "organizacion" varchar;
  ALTER TABLE "users" ADD COLUMN "pais" varchar;
  ALTER TABLE "users" ADD COLUMN "provincia" varchar;
  ALTER TABLE "users" ADD COLUMN "ciudad" varchar;
  ALTER TABLE "users" ADD COLUMN "notas" varchar;
  ALTER TABLE "users" DROP COLUMN IF EXISTS "ubicacion";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "profile_type";
  ALTER TABLE "users" ADD COLUMN "profile_type" "enum_users_profile_type";

  CREATE TABLE "users_intereses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"interes" varchar NOT NULL
  );
  ALTER TABLE "users_intereses" ADD CONSTRAINT "users_intereses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_intereses_order_idx" ON "users_intereses" USING btree ("_order");
  CREATE INDEX "users_intereses_parent_id_idx" ON "users_intereses" USING btree ("_parent_id");

  -- Documentos (colección nueva)
  CREATE TABLE "documentos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"empresa_id" integer,
  	"subido_por_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  ALTER TABLE "documentos" ADD CONSTRAINT "documentos_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documentos" ADD CONSTRAINT "documentos_subido_por_id_users_id_fk" FOREIGN KEY ("subido_por_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "documentos_empresa_idx" ON "documentos" USING btree ("empresa_id");
  CREATE INDEX "documentos_subido_por_idx" ON "documentos" USING btree ("subido_por_id");
  CREATE INDEX "documentos_updated_at_idx" ON "documentos" USING btree ("updated_at");
  CREATE INDEX "documentos_created_at_idx" ON "documentos" USING btree ("created_at");
  CREATE UNIQUE INDEX "documentos_filename_idx" ON "documentos" USING btree ("filename");

  -- Empresas: documentos pasa de array embebido a relationship hacia Documentos
  DROP TABLE IF EXISTS "empresas_documentos" CASCADE;
  ALTER TABLE "empresas_rels" ADD COLUMN "documentos_id" integer;
  ALTER TABLE "empresas_rels" ADD CONSTRAINT "empresas_rels_documentos_fk" FOREIGN KEY ("documentos_id") REFERENCES "public"."documentos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "empresas_rels_documentos_id_idx" ON "empresas_rels" USING btree ("documentos_id");

  -- Empresas: consentimientos nuevos
  ALTER TABLE "empresas" ADD COLUMN "consentimientos_comunicaciones_aceptadas" boolean DEFAULT false;
  ALTER TABLE "empresas" ADD COLUMN "consentimientos_version" varchar;

  -- payload_locked_documents_rels: la colección Documentos necesita su columna
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "documentos_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documentos_fk" FOREIGN KEY ("documentos_id") REFERENCES "public"."documentos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_documentos_id_idx" ON "payload_locked_documents_rels" USING btree ("documentos_id");

  -- Cotizaciones: status → estado (vocabulario nuevo) + presupuesto + marcas del solicitante
  ALTER TABLE "cotizaciones" DROP COLUMN IF EXISTS "status";
  DROP TYPE IF EXISTS "public"."enum_cotizaciones_status";
  ALTER TABLE "cotizaciones" ADD COLUMN "estado" "enum_cotizaciones_estado" DEFAULT 'enviada' NOT NULL;
  ALTER TABLE "cotizaciones" ADD COLUMN "respondida_at" timestamp(3) with time zone;
  ALTER TABLE "cotizaciones" ADD COLUMN "presupuesto_monto" numeric;
  ALTER TABLE "cotizaciones" ADD COLUMN "presupuesto_moneda" "enum_cotizaciones_presupuesto_moneda";
  ALTER TABLE "cotizaciones" ADD COLUMN "presupuesto_validez_dias" numeric;
  ALTER TABLE "cotizaciones" ADD COLUMN "presupuesto_plazo" varchar;
  ALTER TABLE "cotizaciones" ADD COLUMN "presupuesto_archivo_id" integer;
  ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_presupuesto_archivo_id_documentos_id_fk" FOREIGN KEY ("presupuesto_archivo_id") REFERENCES "public"."documentos"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "cotizaciones_presupuesto_archivo_idx" ON "cotizaciones" USING btree ("presupuesto_archivo_id");
  ALTER TABLE "cotizaciones" ADD COLUMN "preferida_at" timestamp(3) with time zone;
  ALTER TABLE "cotizaciones" ADD COLUMN "avance_confirmado_at" timestamp(3) with time zone;

  -- CotizacionUpdates: hilo unificado (mensajes + eventos de sistema)
  ALTER TABLE "cotizacion_updates" ADD COLUMN "accion" "enum_cotizacion_updates_accion" DEFAULT 'mensaje' NOT NULL;
  ALTER TABLE "cotizacion_updates" ALTER COLUMN "mensaje" DROP NOT NULL;
  ALTER TABLE "cotizacion_updates" ADD COLUMN "estado_anterior" "enum_cotizacion_updates_estado_anterior";
  ALTER TABLE "cotizacion_updates" ADD COLUMN "estado_nuevo" "enum_cotizacion_updates_estado_nuevo";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "cotizacion_updates" DROP COLUMN IF EXISTS "estado_nuevo";
  ALTER TABLE "cotizacion_updates" DROP COLUMN IF EXISTS "estado_anterior";
  ALTER TABLE "cotizacion_updates" ALTER COLUMN "mensaje" SET NOT NULL;
  ALTER TABLE "cotizacion_updates" DROP COLUMN IF EXISTS "accion";

  ALTER TABLE "cotizaciones" DROP COLUMN IF EXISTS "avance_confirmado_at";
  ALTER TABLE "cotizaciones" DROP COLUMN IF EXISTS "preferida_at";
  ALTER TABLE "cotizaciones" DROP CONSTRAINT IF EXISTS "cotizaciones_presupuesto_archivo_id_documentos_id_fk";
  ALTER TABLE "cotizaciones" DROP COLUMN IF EXISTS "presupuesto_archivo_id";
  ALTER TABLE "cotizaciones" DROP COLUMN IF EXISTS "presupuesto_plazo";
  ALTER TABLE "cotizaciones" DROP COLUMN IF EXISTS "presupuesto_validez_dias";
  ALTER TABLE "cotizaciones" DROP COLUMN IF EXISTS "presupuesto_moneda";
  ALTER TABLE "cotizaciones" DROP COLUMN IF EXISTS "presupuesto_monto";
  ALTER TABLE "cotizaciones" DROP COLUMN IF EXISTS "respondida_at";
  CREATE TYPE "public"."enum_cotizaciones_status" AS ENUM('pendiente', 'respondida', 'aceptada', 'rechazada', 'cerrada');
  ALTER TABLE "cotizaciones" ADD COLUMN "status" "enum_cotizaciones_status" DEFAULT 'pendiente' NOT NULL;
  ALTER TABLE "cotizaciones" DROP COLUMN IF EXISTS "estado";

  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "documentos_id";

  ALTER TABLE "empresas" DROP COLUMN IF EXISTS "consentimientos_version";
  ALTER TABLE "empresas" DROP COLUMN IF EXISTS "consentimientos_comunicaciones_aceptadas";

  ALTER TABLE "empresas_rels" DROP COLUMN IF EXISTS "documentos_id";
  CREATE TABLE "empresas_documentos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nombre" varchar,
  	"archivo_id" integer
  );
  ALTER TABLE "empresas_documentos" ADD CONSTRAINT "empresas_documentos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;

  DROP TABLE IF EXISTS "documentos" CASCADE;

  ALTER TABLE "users_intereses" DROP CONSTRAINT IF EXISTS "users_intereses_parent_id_fk";
  DROP TABLE IF EXISTS "users_intereses" CASCADE;
  ALTER TABLE "users" DROP COLUMN IF EXISTS "profile_type";
  ALTER TABLE "users" ADD COLUMN "profile_type" varchar;
  ALTER TABLE "users" ADD COLUMN "ubicacion" varchar;
  ALTER TABLE "users" DROP COLUMN IF EXISTS "notas";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "ciudad";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "provincia";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "pais";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "organizacion";

  DROP TYPE IF EXISTS "public"."enum_cotizacion_updates_estado_nuevo";
  DROP TYPE IF EXISTS "public"."enum_cotizacion_updates_estado_anterior";
  DROP TYPE IF EXISTS "public"."enum_cotizacion_updates_accion";
  DROP TYPE IF EXISTS "public"."enum_cotizaciones_presupuesto_moneda";
  DROP TYPE IF EXISTS "public"."enum_cotizaciones_estado";
  DROP TYPE IF EXISTS "public"."enum_users_profile_type";
  -- Nota: los valores agregados a enum_empresas_estado / enum_empresas_tipo_proveedor
  -- no se revierten: Postgres no soporta DROP VALUE sin recrear el tipo completo.
  `)
}
