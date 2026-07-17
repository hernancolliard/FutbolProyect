ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_version VARCHAR(20),
  ADD COLUMN IF NOT EXISTS privacy_version VARCHAR(20);

COMMENT ON COLUMN usuarios.terms_accepted_at IS
  'Fecha y hora en que el usuario aceptó expresamente los términos y la política de privacidad.';
COMMENT ON COLUMN usuarios.terms_version IS
  'Versión de los términos aceptados por el usuario.';
COMMENT ON COLUMN usuarios.privacy_version IS
  'Versión de la política de privacidad aceptada por el usuario.';
