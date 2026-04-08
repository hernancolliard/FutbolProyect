-- Migration: crear tabla profile_ratings y columnas de estadísticas de calificación

CREATE TABLE IF NOT EXISTS profile_ratings (
  profile_id INTEGER NOT NULL REFERENCES perfiles_usuario (id_usuario) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, user_id)
);

ALTER TABLE perfiles_usuario
  ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;
