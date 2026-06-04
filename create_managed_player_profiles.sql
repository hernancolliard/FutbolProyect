-- Perfiles de jugadores gestionados por cuentas de club, agente o scout.
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

CREATE INDEX IF NOT EXISTS idx_managed_player_profiles_owner
  ON managed_player_profiles(owner_user_id);

CREATE INDEX IF NOT EXISTS idx_managed_player_profiles_position
  ON managed_player_profiles(posicion_principal);
