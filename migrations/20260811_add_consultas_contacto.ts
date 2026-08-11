import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Migración escrita a mano (mismo motivo que 20260811_sync_schema.ts):
 * el CLI de payload migrate:create pregunta interactivamente ante cambios
 * de schema, y no hay TTY en el build de Vercel. Esta es aditiva y sin
 * ambigüedad (tabla nueva), así que no hay riesgo de mal interpretar un
 * rename.
 *
 * Agrega la colección ConsultasContacto (formulario de /contacto).
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE "consultas_contacto" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"organizacion" varchar,
  	"asunto" varchar NOT NULL,
  	"mensaje" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "consultas_contacto_id" integer;

  CREATE INDEX "consultas_contacto_created_at_idx" ON "consultas_contacto" USING btree ("created_at");
  CREATE INDEX "consultas_contacto_updated_at_idx" ON "consultas_contacto" USING btree ("updated_at");

  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_consultas_contacto_fk" FOREIGN KEY ("consultas_contacto_id") REFERENCES "public"."consultas_contacto"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_consultas_contacto_id_idx" ON "payload_locked_documents_rels" USING btree ("consultas_contacto_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_consultas_contacto_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "consultas_contacto_id";
  DROP TABLE "consultas_contacto";
  `)
}
