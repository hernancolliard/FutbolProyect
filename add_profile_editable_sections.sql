-- Campos editables para completar las secciones visibles del perfil.
ALTER TABLE perfiles_usuario
  ADD COLUMN IF NOT EXISTS idiomas TEXT,
  ADD COLUMN IF NOT EXISTS estadisticas TEXT,
  ADD COLUMN IF NOT EXISTS trayectoria TEXT,
  ADD COLUMN IF NOT EXISTS disponibilidad VARCHAR(80);

ALTER TABLE managed_player_profiles
  ADD COLUMN IF NOT EXISTS idiomas TEXT,
  ADD COLUMN IF NOT EXISTS estadisticas TEXT,
  ADD COLUMN IF NOT EXISTS trayectoria TEXT,
  ADD COLUMN IF NOT EXISTS disponibilidad VARCHAR(80);
