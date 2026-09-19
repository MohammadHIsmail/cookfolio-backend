-- database/migrations/003_create_users_table.sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password VARCHAR(255),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  google_id VARCHAR(255) UNIQUE,
  apple_id VARCHAR(255) UNIQUE,
  auth_provider VARCHAR(50) NOT NULL DEFAULT 'local',
  avatar_url VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_auth_provider
    CHECK (auth_provider IN ('local', 'google', 'apple')),
  CONSTRAINT chk_local_user_has_credentials
    CHECK (
      auth_provider != 'local'
      OR (username IS NOT NULL AND password IS NOT NULL AND name IS NOT NULL)
    )
);

INSERT INTO schema_migrations (filename) VALUES ('003_create_users_table.sql');