import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Migración escrita a mano (mismo motivo que las anteriores). Aditiva, sin
 * ambigüedad.
 *
 * Agrega Media.uploadedBy — parte del fix de seguridad que le da dueño a
 * Media (antes cualquier usuario autenticado podía borrar cualquier archivo
 * del sitio, sin ningún campo para acotar por dueño). Mismo patrón que
 * Documentos.subidoPor.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "media" ADD COLUMN "uploaded_by_id" integer;
  ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "media_uploaded_by_idx" ON "media" USING btree ("uploaded_by_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "media" DROP CONSTRAINT IF EXISTS "media_uploaded_by_id_users_id_fk";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "uploaded_by_id";
  `)
}
