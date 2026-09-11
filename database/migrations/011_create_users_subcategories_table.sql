-- database/migrations/011_create_users_subcategories_table.sql
CREATE TABLE users_subcategories (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, subcategory_id)
);

INSERT INTO schema_migrations (filename) VALUES ('011_create_users_subcategories_table.sql');