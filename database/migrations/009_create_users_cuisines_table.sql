-- database/migrations/009_create_users_cuisines_table.sql
CREATE TABLE users_cuisines (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cuisine_id UUID NOT NULL REFERENCES cuisines(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, cuisine_id)
);

INSERT INTO schema_migrations (filename) VALUES ('009_create_users_cuisines_table.sql');