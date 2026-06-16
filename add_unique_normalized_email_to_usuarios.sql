-- Before creating the unique index, review existing duplicates:
-- SELECT LOWER(TRIM(email)) AS normalized_email, COUNT(*) AS total, ARRAY_AGG(id ORDER BY id) AS user_ids
-- FROM usuarios
-- GROUP BY LOWER(TRIM(email))
-- HAVING COUNT(*) > 1;

-- Run the UPDATE only after duplicate emails have been merged or removed.
UPDATE usuarios
SET email = LOWER(TRIM(email));

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email_normalized_unique
ON usuarios (LOWER(TRIM(email)));
