import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Migración escrita a mano (mismo motivo que las anteriores: sin TTY en
 * Vercel para el prompt interactivo de payload migrate:create). Aditiva,
 * sin ambigüedad.
 *
 * Extiende ProyectoDrafts con los campos reales del wizard de Fase 4
 * (Guía de proyecto): hoy la colección solo tenía user/wizardStep/brief.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_proyecto_drafts_tipo" AS ENUM('vivienda', 'exterior');

  ALTER TABLE "proyecto_drafts" ADD COLUMN "ref_slug" varchar;
  ALTER TABLE "proyecto_drafts" ADD COLUMN "titulo" varchar;
  ALTER TABLE "proyecto_drafts" ADD COLUMN "tipo" "enum_proyecto_drafts_tipo";
  ALTER TABLE "proyecto_drafts" ADD COLUMN "subtipo" varchar;
  ALTER TABLE "proyecto_drafts" ADD COLUMN "superficie" varchar;
  ALTER TABLE "proyecto_drafts" ADD COLUMN "ubicacion" varchar;
  ALTER TABLE "proyecto_drafts" ADD COLUMN "plazo" varchar;
  ALTER TABLE "proyecto_drafts" ADD COLUMN "presupuesto" varchar;
  ALTER TABLE "proyecto_drafts" ADD COLUMN "notas" varchar;

  CREATE TABLE "proyecto_drafts_terminaciones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"valor" varchar NOT NULL
  );
  ALTER TABLE "proyecto_drafts_terminaciones" ADD CONSTRAINT "proyecto_drafts_terminaciones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."proyecto_drafts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "proyecto_drafts_terminaciones_order_idx" ON "proyecto_drafts_terminaciones" USING btree ("_order");
  CREATE INDEX "proyecto_drafts_terminaciones_parent_id_idx" ON "proyecto_drafts_terminaciones" USING btree ("_parent_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "proyecto_drafts_terminaciones" DROP CONSTRAINT IF EXISTS "proyecto_drafts_terminaciones_parent_id_fk";
  DROP TABLE IF EXISTS "proyecto_drafts_terminaciones" CASCADE;

  ALTER TABLE "proyecto_drafts" DROP COLUMN IF EXISTS "ref_slug";
  ALTER TABLE "proyecto_drafts" DROP COLUMN IF EXISTS "titulo";
  ALTER TABLE "proyecto_drafts" DROP COLUMN IF EXISTS "tipo";
  ALTER TABLE "proyecto_drafts" DROP COLUMN IF EXISTS "subtipo";
  ALTER TABLE "proyecto_drafts" DROP COLUMN IF EXISTS "superficie";
  ALTER TABLE "proyecto_drafts" DROP COLUMN IF EXISTS "ubicacion";
  ALTER TABLE "proyecto_drafts" DROP COLUMN IF EXISTS "plazo";
  ALTER TABLE "proyecto_drafts" DROP COLUMN IF EXISTS "presupuesto";
  ALTER TABLE "proyecto_drafts" DROP COLUMN IF EXISTS "notas";

  DROP TYPE IF EXISTS "public"."enum_proyecto_drafts_tipo";
  `)
}
