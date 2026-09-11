-- database/migrations/010_create_users_categories_table.sql
CREATE TABLE users_categories (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, category_id)
);

INSERT INTO schema_migrations (filename) VALUES ('010_create_users_categories_table.sql');