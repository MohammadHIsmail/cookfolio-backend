-- database/migrations/004_create_cuisines_table.sql
CREATE TABLE cuisines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO schema_migrations (filename) VALUES ('004_create_cuisines_table.sql');