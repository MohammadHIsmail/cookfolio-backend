-- database/migrations/002_enable_extensions.sql
-- gen_random_uuid() — used as the default id on every table from here on
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO schema_migrations (filename) VALUES ('002_enable_extensions.sql');