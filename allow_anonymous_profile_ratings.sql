-- Permite calificaciones de perfiles sin cuenta registrada.
-- Ejecutar antes de desplegar el backend que acepta votos anonimos.

ALTER TABLE profile_ratings
  ADD COLUMN IF NOT EXISTS anonymous_voter_id VARCHAR(128),
  ADD COLUMN IF NOT EXISTS voter_ip_hash CHAR(64),
  ADD COLUMN IF NOT EXISTS voter_user_agent_hash CHAR(64);

ALTER TABLE profile_ratings
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE profile_ratings
  DROP CONSTRAINT IF EXISTS profile_ratings_pkey;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profile_ratings_voter_identity_check'
  ) THEN
    ALTER TABLE profile_ratings
      ADD CONSTRAINT profile_ratings_voter_identity_check
      CHECK (user_id IS NOT NULL OR anonymous_voter_id IS NOT NULL);
  END IF;
END $$;

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
