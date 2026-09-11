-- database/migrations/008_create_recipes_table.sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  ingredients JSONB NOT NULL,
  directions TEXT NOT NULL,
  image VARCHAR(255),
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  cuisine_id UUID REFERENCES cuisines(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_ingredients_is_array CHECK (jsonb_typeof(ingredients) = 'array')
);

INSERT INTO schema_migrations (filename) VALUES ('008_create_recipes_table.sql');