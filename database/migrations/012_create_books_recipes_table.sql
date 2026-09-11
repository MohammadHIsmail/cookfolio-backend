-- database/migrations/012_create_books_recipes_table.sql
CREATE TABLE books_recipes (
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (book_id, recipe_id)
);

INSERT INTO schema_migrations (filename) VALUES ('012_create_books_recipes_table.sql');