-- Migration: crear tabla profile_ratings y columnas de estadísticas de calificación

CREATE TABLE IF NOT EXISTS profile_ratings (
  profile_id INTEGER NOT NULL REFERENCES perfiles_usuario (id_usuario) ON DELETE CASCADE,
  user_id INTEGER REFERENCES usuarios (id) ON DELETE CASCADE,
  anonymous_voter_id VARCHAR(128),
  voter_ip_hash CHAR(64),
  voter_user_agent_hash CHAR(64),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profile_ratings_voter_identity_check
    CHECK (user_id IS NOT NULL OR anonymous_voter_id IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS profile_ratings_profile_user_unique
  ON profile_ratings (profile_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profile_ratings_profile_anonymous_unique
  ON profile_ratings (profile_id, anonymous_voter_id)
  WHERE anonymous_voter_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profile_ratings_profile_anonymous_fingerprint_unique
  ON profile_ratings (profile_id, voter_ip_hash, voter_user_agent_hash)
  WHERE user_id IS NULL
    AND voter_ip_hash IS NOT NULL
    AND voter_user_agent_hash IS NOT NULL;

ALTER TABLE perfiles_usuario
  ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;
