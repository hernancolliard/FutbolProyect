ALTER TABLE perfiles_usuario
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

UPDATE perfiles_usuario AS p
SET
  created_at = COALESCE(p.created_at, u.fecha_creacion, NOW()),
  updated_at = COALESCE(p.updated_at, u.fecha_creacion, NOW())
FROM usuarios AS u
WHERE u.id = p.id_usuario
  AND (p.created_at IS NULL OR p.updated_at IS NULL);

UPDATE perfiles_usuario
SET
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL OR updated_at IS NULL;

ALTER TABLE perfiles_usuario
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL;
