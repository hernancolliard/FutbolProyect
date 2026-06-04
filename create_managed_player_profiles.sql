-- Perfiles de jugadores gestionados por cuentas de club, agente o scout.
ALTER TABLE perfiles_usuario
ADD COLUMN IF NOT EXISTS agente_nombre VARCHAR(150),
ADD COLUMN IF NOT EXISTS agente_contacto VARCHAR(255);

CREATE TABLE IF NOT EXISTS managed_player_profiles (
  id SERIAL PRIMARY KEY,
  owner_user_id INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  email VARCHAR(100),
  foto_perfil_url VARCHAR(255),
  telefono VARCHAR(50),
  nacionalidad VARCHAR(100),
  resumen_profesional TEXT,
  cv_url VARCHAR(255),
  posicion_principal VARCHAR(100),
  linkedin_url VARCHAR(255),
  instagram_url VARCHAR(255),
  youtube_url VARCHAR(255),
  transfermarkt_url VARCHAR(255),
  whatsapp_url VARCHAR(255),
  agente_nombre VARCHAR(150),
  agente_contacto VARCHAR(255),
  altura_cm INTEGER,
  peso_kg INTEGER,
  pie_dominante VARCHAR(50),
  fecha_de_nacimiento DATE,
  profile_views INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  resumen_profesional_es TEXT,
  resumen_profesional_en TEXT,
  posicion_principal_es VARCHAR(100),
  posicion_principal_en VARCHAR(100),
  nacionalidad_es VARCHAR(100),
  nacionalidad_en VARCHAR(100),
  pie_dominante_es VARCHAR(50),
  pie_dominante_en VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE managed_player_profiles
ADD COLUMN IF NOT EXISTS agente_nombre VARCHAR(150),
ADD COLUMN IF NOT EXISTS agente_contacto VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_managed_player_profiles_owner
  ON managed_player_profiles(owner_user_id);

CREATE INDEX IF NOT EXISTS idx_managed_player_profiles_position
  ON managed_player_profiles(posicion_principal);

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
