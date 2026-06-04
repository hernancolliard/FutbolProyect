-- Campos de agente para perfiles existentes y gestionados.
ALTER TABLE perfiles_usuario
ADD COLUMN IF NOT EXISTS agente_nombre VARCHAR(150),
ADD COLUMN IF NOT EXISTS agente_contacto VARCHAR(255);

ALTER TABLE managed_player_profiles
ADD COLUMN IF NOT EXISTS agente_nombre VARCHAR(150),
ADD COLUMN IF NOT EXISTS agente_contacto VARCHAR(255);

-- Fotos de perfiles gestionados.
CREATE TABLE IF NOT EXISTS managed_profile_photos (
  id SERIAL PRIMARY KEY,
  managed_profile_id INTEGER NOT NULL REFERENCES managed_player_profiles(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  title VARCHAR(255),
  title_es VARCHAR(255),
  title_en VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_managed_profile_photos_profile
  ON managed_profile_photos(managed_profile_id);

-- Videos de perfiles gestionados.
CREATE TABLE IF NOT EXISTS managed_profile_videos (
  id SERIAL PRIMARY KEY,
  managed_profile_id INTEGER NOT NULL REFERENCES managed_player_profiles(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  title_es VARCHAR(100),
  title_en VARCHAR(100),
  youtube_url VARCHAR(255) NOT NULL,
  cover_image_url VARCHAR(500),
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (managed_profile_id, position)
);

CREATE INDEX IF NOT EXISTS idx_managed_profile_videos_profile
  ON managed_profile_videos(managed_profile_id);
