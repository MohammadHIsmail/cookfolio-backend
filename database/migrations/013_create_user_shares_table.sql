-- database/migrations/013_create_user_shares_table.sql
CREATE TABLE user_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_shared_from UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_shared_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_share_target CHECK (
    (book_id IS NOT NULL AND recipe_id IS NULL) OR
    (book_id IS NULL AND recipe_id IS NOT NULL)
  )
);

INSERT INTO schema_migrations (filename) VALUES ('013_create_user_shares_table.sql');