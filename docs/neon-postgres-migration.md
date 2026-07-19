# Neon Postgres migration

The application runtime uses `NEON_DB_POSTGRES_URL` and
`@neondatabase/serverless`. The versioned Neon baseline is stored in
`scripts/sql`.

## Initialize an empty Neon database

1. Put the Neon connection string in the untracked `.env` file as
   `NEON_DB_POSTGRES_URL`.
2. Run:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

`db:migrate` applies `scripts/sql/0001_init.sql` once and
records it in `_app_migrations`. It creates Postgres enums, JSONB columns,
indexes, and foreign keys required by the CMS.

## One-time Hostinger MySQL import

`db:migrate:hostinger-data` is an idempotent, non-destructive importer for the
previous Hostinger MySQL schema. It inserts rows absent from Neon and updates
matching canonical records. Identity matches take priority; for pages, content
types/items, navigation groups, settings, blogs, and admin users, a matching
slug, key, or email is also canonical. In that case the existing Neon ID is
retained and all imported relationships are remapped to it. It never truncates
or deletes Neon data.

The importer covers CMS pages and their sections/modules, course documents,
content model data, navigation, settings, blogs, media, admin users, revisions,
module-library data, leads, and bookings. JSON is loaded as JSONB, MySQL
booleans are converted to PostgreSQL booleans, and timestamp strings are
preserved without locale conversion.

1. Take a consistent MySQL backup and pause Hostinger writes for the import.
2. Put `NEON_DB_POSTGRES_URL` in ignored `.env`, and put the legacy URL in an ignored
   `HOSTINGER_DATABASE_URL` (or `LEGACY_MYSQL_URL`) environment variable.
   The application does not read either legacy variable at runtime.
3. Inspect the import without writing:

   ```bash
   npm run db:migrate:hostinger-data -- --dry-run
   ```

4. Run the import:

   ```bash
   npm run db:migrate:hostinger-data
   ```

5. Run the command again if needed; it is safe and converges canonical source
   records. Review any `Unmapped source tables` or `Skipped missing source
   table` messages: these are intentionally not guessed or converted.

Do not run `npm run db:seed` after importing production data: the seed is for a
new development database and clears CMS rows before rebuilding defaults.

## Populate only missing CMS content

For a populated Neon database that is missing bundled course or shared CMS
content, run:

```bash
npm run db:seed:missing
```

This command only creates absent rows: course and online-course documents and
modules, plus teacher records and missing navigation entries where applicable.
It does not delete or update existing CMS rows, so it is safe to use without
replacing live edits.
