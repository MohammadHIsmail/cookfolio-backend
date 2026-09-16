CREATE TABLE otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash VARCHAR(255) NOT NULL,
  purpose VARCHAR(50) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  attempts SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_otp_purpose CHECK (purpose IN ('email_verification', 'password_reset'))
);

-- Fast lookup of the active code for a user+purpose
CREATE INDEX idx_otps_user_purpose ON otps (user_id, purpose, consumed_at);

INSERT INTO schema_migrations (filename) VALUES ('014_create_otps_table.sql');