import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "pages_tenant_id_idx" ON "pages" ("tenant_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_tenant_id_idx" ON "_pages_v" ("tenant_id");
    CREATE INDEX IF NOT EXISTS "posts_tenant_id_idx" ON "posts" ("tenant_id");
    CREATE INDEX IF NOT EXISTS "_posts_v_tenant_id_idx" ON "_posts_v" ("tenant_id");
    CREATE INDEX IF NOT EXISTS "projects_tenant_id_idx" ON "projects" ("tenant_id");
    CREATE INDEX IF NOT EXISTS "abouts_tenant_id_idx" ON "abouts" ("tenant_id");
    CREATE INDEX IF NOT EXISTS "galleries_tenant_id_idx" ON "galleries" ("tenant_id");
    CREATE INDEX IF NOT EXISTS "media_tenant_id_idx" ON "media" ("tenant_id");
    CREATE INDEX IF NOT EXISTS "users_tenant_id_idx" ON "users_tenants" ("tenant_id");
    CREATE INDEX IF NOT EXISTS "redirects_tenant_id_idx" ON "redirects" ("tenant_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "pages_tenant_id_idx";
    DROP INDEX IF EXISTS "_pages_v_tenant_id_idx";
    DROP INDEX IF EXISTS "posts_tenant_id_idx";
    DROP INDEX IF EXISTS "_posts_v_tenant_id_idx";
    DROP INDEX IF EXISTS "projects_tenant_id_idx";
    DROP INDEX IF EXISTS "abouts_tenant_id_idx";
    DROP INDEX IF EXISTS "galleries_tenant_id_idx";
    DROP INDEX IF EXISTS "media_tenant_id_idx";
    DROP INDEX IF EXISTS "users_tenant_id_idx";
    DROP INDEX IF EXISTS "redirects_tenant_id_idx";
  `)
}
