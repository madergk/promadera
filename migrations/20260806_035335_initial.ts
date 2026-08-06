import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'proveedor', 'cliente');
  CREATE TYPE "public"."enum_empresas_tipo_proveedor" AS ENUM('fabricante', 'distribuidor', 'constructora', 'servicios');
  CREATE TYPE "public"."enum_empresas_estado" AS ENUM('borrador', 'en_revision', 'publicado', 'rechazado');
  CREATE TYPE "public"."enum_proyectos_categoria" AS ENUM('Vivienda', 'Comercial', 'Institucional', 'Industrial', 'Turismo');
  CREATE TYPE "public"."enum_educacion_programas_modalidad" AS ENUM('presencial', 'virtual', 'hibrido');
  CREATE TYPE "public"."enum_cotizaciones_tipo_consulta" AS ENUM('producto', 'servicio', 'proyecto');
  CREATE TYPE "public"."enum_cotizaciones_status" AS ENUM('pendiente', 'respondida', 'aceptada', 'rechazada', 'cerrada');
  CREATE TYPE "public"."enum_consultas_proveedores_rubro" AS ENUM('Aserradero', 'Constructora', 'Carpintería / CLT', 'Estudio de arquitectura', 'Proveedor de insumos', 'Logística', 'Otro');
  CREATE TYPE "public"."enum_consultas_proveedores_provincia" AS ENUM('Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre_completo" varchar,
  	"role" "enum_users_role" DEFAULT 'cliente' NOT NULL,
  	"onboarded" boolean DEFAULT false,
  	"profile_type" varchar,
  	"telefono" varchar,
  	"ubicacion" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
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
  
  CREATE TABLE "empresas_servicios" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"servicio" varchar NOT NULL
  );
  
  CREATE TABLE "empresas_servicios_detalle" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"servicio" varchar NOT NULL,
  	"detalle" varchar
  );
  
  CREATE TABLE "empresas_productos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"descripcion" varchar,
  	"imagen_id" integer
  );
  
  CREATE TABLE "empresas_documentos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nombre" varchar,
  	"archivo_id" integer
  );
  
  CREATE TABLE "empresas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"sector" varchar,
  	"descripcion" varchar,
  	"ubicacion" varchar,
  	"tipo_proveedor" "enum_empresas_tipo_proveedor",
  	"logo_id" integer,
  	"sitio_web" varchar,
  	"anio_fundacion" numeric,
  	"empleados" varchar,
  	"estado" "enum_empresas_estado" DEFAULT 'borrador' NOT NULL,
  	"publicada" boolean DEFAULT false,
  	"user_id" integer,
  	"contacto" varchar,
  	"telefono" varchar,
  	"whatsapp" varchar,
  	"consentimientos_terminos_aceptados" boolean DEFAULT false,
  	"consentimientos_fecha_consentimiento" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "empresas_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "proyectos_materiales" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"material" varchar NOT NULL
  );
  
  CREATE TABLE "proyectos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"resumen" varchar,
  	"descripcion" varchar,
  	"categoria" "enum_proyectos_categoria",
  	"ubicacion" varchar,
  	"anio" numeric,
  	"arquitecto" varchar,
  	"constructora" varchar,
  	"sistema_constructivo" varchar,
  	"impacto_carbono" varchar,
  	"portada_id" integer,
  	"publicado" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "proyectos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"empresas_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "noticias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"resumen" varchar,
  	"contenido" jsonb,
  	"categoria" varchar,
  	"autor" varchar,
  	"imagen_id" integer,
  	"destacada" boolean DEFAULT false,
  	"publicada" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "biblioteca_recursos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"categoria" varchar,
  	"archivo_id" integer NOT NULL,
  	"paginas" numeric,
  	"publicado" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "educacion_programas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"descripcion" varchar,
  	"modalidad" "enum_educacion_programas_modalidad",
  	"duracion" varchar,
  	"publicado" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "agenda_eventos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"fecha" timestamp(3) with time zone NOT NULL,
  	"lugar" varchar,
  	"descripcion" varchar,
  	"publicado" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cotizaciones" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"empresa_id" integer NOT NULL,
  	"solicitante_id" integer NOT NULL,
  	"tipo_consulta" "enum_cotizaciones_tipo_consulta" DEFAULT 'proyecto' NOT NULL,
  	"referencia" varchar,
  	"descripcion" varchar NOT NULL,
  	"cantidad" varchar,
  	"plazo" varchar,
  	"ubicacion" varchar,
  	"presupuesto" varchar,
  	"solicitante_nombre" varchar NOT NULL,
  	"solicitante_email" varchar NOT NULL,
  	"solicitante_telefono" varchar,
  	"solicitante_empresa" varchar,
  	"status" "enum_cotizaciones_status" DEFAULT 'pendiente' NOT NULL,
  	"respuesta" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cotizacion_updates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cotizacion_id" integer NOT NULL,
  	"autor_id" integer NOT NULL,
  	"mensaje" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "proyecto_drafts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"wizard_step" numeric DEFAULT 0,
  	"brief" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "consultas_proveedores" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"rubro" "enum_consultas_proveedores_rubro" NOT NULL,
  	"provincia" "enum_consultas_proveedores_provincia" NOT NULL,
  	"sitio_web" varchar,
  	"mensaje" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"empresas_id" integer,
  	"proyectos_id" integer,
  	"noticias_id" integer,
  	"biblioteca_recursos_id" integer,
  	"educacion_programas_id" integer,
  	"agenda_eventos_id" integer,
  	"cotizaciones_id" integer,
  	"cotizacion_updates_id" integer,
  	"proyecto_drafts_id" integer,
  	"consultas_proveedores_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_theme" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"color_primario" varchar,
  	"color_secundario" varchar,
  	"logo_claro_id" integer,
  	"logo_oscuro_id" integer,
  	"fuente_titulos" varchar,
  	"fuente_cuerpo" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "empresas_servicios" ADD CONSTRAINT "empresas_servicios_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "empresas_servicios_detalle" ADD CONSTRAINT "empresas_servicios_detalle_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "empresas_productos" ADD CONSTRAINT "empresas_productos_imagen_id_media_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "empresas_productos" ADD CONSTRAINT "empresas_productos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "empresas_documentos" ADD CONSTRAINT "empresas_documentos_archivo_id_media_id_fk" FOREIGN KEY ("archivo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "empresas_documentos" ADD CONSTRAINT "empresas_documentos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "empresas" ADD CONSTRAINT "empresas_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "empresas" ADD CONSTRAINT "empresas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "empresas_rels" ADD CONSTRAINT "empresas_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "empresas_rels" ADD CONSTRAINT "empresas_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proyectos_materiales" ADD CONSTRAINT "proyectos_materiales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."proyectos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_portada_id_media_id_fk" FOREIGN KEY ("portada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "proyectos_rels" ADD CONSTRAINT "proyectos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."proyectos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proyectos_rels" ADD CONSTRAINT "proyectos_rels_empresas_fk" FOREIGN KEY ("empresas_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proyectos_rels" ADD CONSTRAINT "proyectos_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "noticias" ADD CONSTRAINT "noticias_imagen_id_media_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "biblioteca_recursos" ADD CONSTRAINT "biblioteca_recursos_archivo_id_media_id_fk" FOREIGN KEY ("archivo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_solicitante_id_users_id_fk" FOREIGN KEY ("solicitante_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cotizacion_updates" ADD CONSTRAINT "cotizacion_updates_cotizacion_id_cotizaciones_id_fk" FOREIGN KEY ("cotizacion_id") REFERENCES "public"."cotizaciones"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cotizacion_updates" ADD CONSTRAINT "cotizacion_updates_autor_id_users_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "proyecto_drafts" ADD CONSTRAINT "proyecto_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_empresas_fk" FOREIGN KEY ("empresas_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_proyectos_fk" FOREIGN KEY ("proyectos_id") REFERENCES "public"."proyectos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_noticias_fk" FOREIGN KEY ("noticias_id") REFERENCES "public"."noticias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_biblioteca_recursos_fk" FOREIGN KEY ("biblioteca_recursos_id") REFERENCES "public"."biblioteca_recursos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_educacion_programas_fk" FOREIGN KEY ("educacion_programas_id") REFERENCES "public"."educacion_programas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_agenda_eventos_fk" FOREIGN KEY ("agenda_eventos_id") REFERENCES "public"."agenda_eventos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cotizaciones_fk" FOREIGN KEY ("cotizaciones_id") REFERENCES "public"."cotizaciones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cotizacion_updates_fk" FOREIGN KEY ("cotizacion_updates_id") REFERENCES "public"."cotizacion_updates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_proyecto_drafts_fk" FOREIGN KEY ("proyecto_drafts_id") REFERENCES "public"."proyecto_drafts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_consultas_proveedores_fk" FOREIGN KEY ("consultas_proveedores_id") REFERENCES "public"."consultas_proveedores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_theme" ADD CONSTRAINT "site_theme_logo_claro_id_media_id_fk" FOREIGN KEY ("logo_claro_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_theme" ADD CONSTRAINT "site_theme_logo_oscuro_id_media_id_fk" FOREIGN KEY ("logo_oscuro_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "empresas_servicios_order_idx" ON "empresas_servicios" USING btree ("_order");
  CREATE INDEX "empresas_servicios_parent_id_idx" ON "empresas_servicios" USING btree ("_parent_id");
  CREATE INDEX "empresas_servicios_detalle_order_idx" ON "empresas_servicios_detalle" USING btree ("_order");
  CREATE INDEX "empresas_servicios_detalle_parent_id_idx" ON "empresas_servicios_detalle" USING btree ("_parent_id");
  CREATE INDEX "empresas_productos_order_idx" ON "empresas_productos" USING btree ("_order");
  CREATE INDEX "empresas_productos_parent_id_idx" ON "empresas_productos" USING btree ("_parent_id");
  CREATE INDEX "empresas_productos_imagen_idx" ON "empresas_productos" USING btree ("imagen_id");
  CREATE INDEX "empresas_documentos_order_idx" ON "empresas_documentos" USING btree ("_order");
  CREATE INDEX "empresas_documentos_parent_id_idx" ON "empresas_documentos" USING btree ("_parent_id");
  CREATE INDEX "empresas_documentos_archivo_idx" ON "empresas_documentos" USING btree ("archivo_id");
  CREATE UNIQUE INDEX "empresas_slug_idx" ON "empresas" USING btree ("slug");
  CREATE INDEX "empresas_logo_idx" ON "empresas" USING btree ("logo_id");
  CREATE INDEX "empresas_user_idx" ON "empresas" USING btree ("user_id");
  CREATE INDEX "empresas_updated_at_idx" ON "empresas" USING btree ("updated_at");
  CREATE INDEX "empresas_created_at_idx" ON "empresas" USING btree ("created_at");
  CREATE INDEX "empresas_rels_order_idx" ON "empresas_rels" USING btree ("order");
  CREATE INDEX "empresas_rels_parent_idx" ON "empresas_rels" USING btree ("parent_id");
  CREATE INDEX "empresas_rels_path_idx" ON "empresas_rels" USING btree ("path");
  CREATE INDEX "empresas_rels_media_id_idx" ON "empresas_rels" USING btree ("media_id");
  CREATE INDEX "proyectos_materiales_order_idx" ON "proyectos_materiales" USING btree ("_order");
  CREATE INDEX "proyectos_materiales_parent_id_idx" ON "proyectos_materiales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "proyectos_slug_idx" ON "proyectos" USING btree ("slug");
  CREATE INDEX "proyectos_portada_idx" ON "proyectos" USING btree ("portada_id");
  CREATE INDEX "proyectos_updated_at_idx" ON "proyectos" USING btree ("updated_at");
  CREATE INDEX "proyectos_created_at_idx" ON "proyectos" USING btree ("created_at");
  CREATE INDEX "proyectos_rels_order_idx" ON "proyectos_rels" USING btree ("order");
  CREATE INDEX "proyectos_rels_parent_idx" ON "proyectos_rels" USING btree ("parent_id");
  CREATE INDEX "proyectos_rels_path_idx" ON "proyectos_rels" USING btree ("path");
  CREATE INDEX "proyectos_rels_empresas_id_idx" ON "proyectos_rels" USING btree ("empresas_id");
  CREATE INDEX "proyectos_rels_media_id_idx" ON "proyectos_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "noticias_slug_idx" ON "noticias" USING btree ("slug");
  CREATE INDEX "noticias_imagen_idx" ON "noticias" USING btree ("imagen_id");
  CREATE INDEX "noticias_updated_at_idx" ON "noticias" USING btree ("updated_at");
  CREATE INDEX "noticias_created_at_idx" ON "noticias" USING btree ("created_at");
  CREATE INDEX "biblioteca_recursos_archivo_idx" ON "biblioteca_recursos" USING btree ("archivo_id");
  CREATE INDEX "biblioteca_recursos_updated_at_idx" ON "biblioteca_recursos" USING btree ("updated_at");
  CREATE INDEX "biblioteca_recursos_created_at_idx" ON "biblioteca_recursos" USING btree ("created_at");
  CREATE INDEX "educacion_programas_updated_at_idx" ON "educacion_programas" USING btree ("updated_at");
  CREATE INDEX "educacion_programas_created_at_idx" ON "educacion_programas" USING btree ("created_at");
  CREATE INDEX "agenda_eventos_updated_at_idx" ON "agenda_eventos" USING btree ("updated_at");
  CREATE INDEX "agenda_eventos_created_at_idx" ON "agenda_eventos" USING btree ("created_at");
  CREATE INDEX "cotizaciones_empresa_idx" ON "cotizaciones" USING btree ("empresa_id");
  CREATE INDEX "cotizaciones_solicitante_idx" ON "cotizaciones" USING btree ("solicitante_id");
  CREATE INDEX "cotizaciones_updated_at_idx" ON "cotizaciones" USING btree ("updated_at");
  CREATE INDEX "cotizaciones_created_at_idx" ON "cotizaciones" USING btree ("created_at");
  CREATE INDEX "cotizacion_updates_cotizacion_idx" ON "cotizacion_updates" USING btree ("cotizacion_id");
  CREATE INDEX "cotizacion_updates_autor_idx" ON "cotizacion_updates" USING btree ("autor_id");
  CREATE INDEX "cotizacion_updates_updated_at_idx" ON "cotizacion_updates" USING btree ("updated_at");
  CREATE INDEX "cotizacion_updates_created_at_idx" ON "cotizacion_updates" USING btree ("created_at");
  CREATE INDEX "proyecto_drafts_user_idx" ON "proyecto_drafts" USING btree ("user_id");
  CREATE INDEX "proyecto_drafts_updated_at_idx" ON "proyecto_drafts" USING btree ("updated_at");
  CREATE INDEX "proyecto_drafts_created_at_idx" ON "proyecto_drafts" USING btree ("created_at");
  CREATE INDEX "consultas_proveedores_updated_at_idx" ON "consultas_proveedores" USING btree ("updated_at");
  CREATE INDEX "consultas_proveedores_created_at_idx" ON "consultas_proveedores" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_empresas_id_idx" ON "payload_locked_documents_rels" USING btree ("empresas_id");
  CREATE INDEX "payload_locked_documents_rels_proyectos_id_idx" ON "payload_locked_documents_rels" USING btree ("proyectos_id");
  CREATE INDEX "payload_locked_documents_rels_noticias_id_idx" ON "payload_locked_documents_rels" USING btree ("noticias_id");
  CREATE INDEX "payload_locked_documents_rels_biblioteca_recursos_id_idx" ON "payload_locked_documents_rels" USING btree ("biblioteca_recursos_id");
  CREATE INDEX "payload_locked_documents_rels_educacion_programas_id_idx" ON "payload_locked_documents_rels" USING btree ("educacion_programas_id");
  CREATE INDEX "payload_locked_documents_rels_agenda_eventos_id_idx" ON "payload_locked_documents_rels" USING btree ("agenda_eventos_id");
  CREATE INDEX "payload_locked_documents_rels_cotizaciones_id_idx" ON "payload_locked_documents_rels" USING btree ("cotizaciones_id");
  CREATE INDEX "payload_locked_documents_rels_cotizacion_updates_id_idx" ON "payload_locked_documents_rels" USING btree ("cotizacion_updates_id");
  CREATE INDEX "payload_locked_documents_rels_proyecto_drafts_id_idx" ON "payload_locked_documents_rels" USING btree ("proyecto_drafts_id");
  CREATE INDEX "payload_locked_documents_rels_consultas_proveedores_id_idx" ON "payload_locked_documents_rels" USING btree ("consultas_proveedores_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_theme_logo_claro_idx" ON "site_theme" USING btree ("logo_claro_id");
  CREATE INDEX "site_theme_logo_oscuro_idx" ON "site_theme" USING btree ("logo_oscuro_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "empresas_servicios" CASCADE;
  DROP TABLE "empresas_servicios_detalle" CASCADE;
  DROP TABLE "empresas_productos" CASCADE;
  DROP TABLE "empresas_documentos" CASCADE;
  DROP TABLE "empresas" CASCADE;
  DROP TABLE "empresas_rels" CASCADE;
  DROP TABLE "proyectos_materiales" CASCADE;
  DROP TABLE "proyectos" CASCADE;
  DROP TABLE "proyectos_rels" CASCADE;
  DROP TABLE "noticias" CASCADE;
  DROP TABLE "biblioteca_recursos" CASCADE;
  DROP TABLE "educacion_programas" CASCADE;
  DROP TABLE "agenda_eventos" CASCADE;
  DROP TABLE "cotizaciones" CASCADE;
  DROP TABLE "cotizacion_updates" CASCADE;
  DROP TABLE "proyecto_drafts" CASCADE;
  DROP TABLE "consultas_proveedores" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_theme" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_empresas_tipo_proveedor";
  DROP TYPE "public"."enum_empresas_estado";
  DROP TYPE "public"."enum_proyectos_categoria";
  DROP TYPE "public"."enum_educacion_programas_modalidad";
  DROP TYPE "public"."enum_cotizaciones_tipo_consulta";
  DROP TYPE "public"."enum_cotizaciones_status";
  DROP TYPE "public"."enum_consultas_proveedores_rubro";
  DROP TYPE "public"."enum_consultas_proveedores_provincia";`)
}
